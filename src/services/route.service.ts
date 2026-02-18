import { RouteModel, IRoute, generateRouteCode } from '../models/Route.model';
import { WorkOrderModel } from '../models/WorkOrder.model';
import { AppError } from '../middlewares/errorHandler.middleware';
import { Types } from 'mongoose';

interface CreateRouteData {
    date: string;
    vehicleId?: string;
    technicianId?: string;
    workOrderIds: string[];
    notes?: string;
}

interface ListRouteParams {
    tenantId: string;
    status?: string;
    date?: string;
    technicianId?: string;
    page?: number;
    limit?: number;
}

interface Coordinate {
    lat: number;
    lng: number;
}

// Função auxiliar para calcular distância (Haversine formula)
function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
    const R = 6371; // Raio da Terra em km
    const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
    const dLng = (coord2.lng - coord1.lng) * Math.PI / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) *
        Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

export const routeService = {
    async list({ tenantId, status, date, technicianId, page = 1, limit = 20 }: ListRouteParams) {
        const filter: any = { tenantId: new Types.ObjectId(tenantId) };
        if (status && status !== 'all') filter.status = status;
        if (date) {
            const startDate = new Date(date);
            startDate.setHours(0, 0, 0, 0);
            const endDate = new Date(date);
            endDate.setHours(23, 59, 59, 999);
            filter.date = { $gte: startDate, $lte: endDate };
        }
        if (technicianId) filter.technicianId = new Types.ObjectId(technicianId);

        const skip = (page - 1) * limit;
        const [routes, total] = await Promise.all([
            RouteModel.find(filter)
                .populate('technicianId', 'name')
                .populate('vehicleId', 'plate model')
                .sort({ date: -1, createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .lean(),
            RouteModel.countDocuments(filter)
        ]);

        return {
            routes: routes.map((r: any) => ({
                ...r,
                totalStops: r.stops.length,
                completedStops: r.stops.filter((s: any) => s.status === 'completed').length,
                technicianName: r.technicianId?.name,
                vehiclePlate: r.vehicleId?.plate
            })),
            total,
            page,
            totalPages: Math.ceil(total / limit)
        };
    },

    async getById(tenantId: string, id: string) {
        const route = await RouteModel.findOne({
            _id: new Types.ObjectId(id),
            tenantId: new Types.ObjectId(tenantId)
        })
            .populate('technicianId', 'name')
            .populate('vehicleId', 'plate model')
            .populate({
                path: 'stops.workOrderId',
                select: 'code type priority customerId locationAddress status',
                populate: { path: 'customerId', select: 'name addresses' }
            })
            .lean();

        if (!route) throw new AppError('Rota não encontrada', 404);
        return route;
    },

    async create(tenantId: string, userId: string, data: CreateRouteData) {
        const tenantObjectId = new Types.ObjectId(tenantId);
        const code = await generateRouteCode(tenantObjectId);

        // Se a lista de OSs não vier otimizada do front, salvamos na ordem recebida.
        // A otimização deve ser chamada ANTES de criar a rota, via endpoint específico,
        // ou podemos otimizar aqui se uma flag for passada. Por enquanto, segue a ordem.

        const stops = data.workOrderIds.map((woId, index) => ({
            workOrderId: new Types.ObjectId(woId),
            order: index + 1,
            status: 'pending'
        }));

        const route = await RouteModel.create({
            tenantId: tenantObjectId,
            code,
            date: new Date(data.date),
            vehicleId: data.vehicleId ? new Types.ObjectId(data.vehicleId) : undefined,
            technicianId: data.technicianId ? new Types.ObjectId(data.technicianId) : undefined,
            stops,
            notes: data.notes,
            status: 'draft'
        });

        return route;
    },

    async updateStatus(tenantId: string, id: string, status: string) {
        const route = await RouteModel.findOneAndUpdate(
            { _id: new Types.ObjectId(id), tenantId: new Types.ObjectId(tenantId) },
            { $set: { status } },
            { new: true }
        );
        if (!route) throw new AppError('Rota não encontrada', 404);
        return route;
    },

    // Algoritmo Vizinho Mais Próximo (Nearest Neighbor)
    async optimizeRoute(tenantId: string, workOrderIds: string[], startLat?: number, startLng?: number) {
        // 1. Buscar todas as OSs com seus endereços/coords
        const workOrders = await WorkOrderModel.find({
            _id: { $in: workOrderIds.map(id => new Types.ObjectId(id)) },
            tenantId: new Types.ObjectId(tenantId)
        })
            .populate('customerId', 'addresses')
            .lean();

        // 2. Extrair coordenadas válidas
        const points = workOrders.map((wo: any) => {
            const primaryAddr = wo.customerId?.addresses?.find((a: any) => a.isPrimary)
                || wo.customerId?.addresses?.[0];
            return {
                id: wo._id.toString(),
                lat: primaryAddr?.lat || wo.locationId?.lat,
                lng: primaryAddr?.lng || wo.locationId?.lng,
                code: wo.code
            };
        }).filter(p => p.lat && p.lng);

        if (points.length === 0) return workOrderIds; // Sem coordenadas, retorna original

        // 3. Algoritmo NN
        const optimizedIds: string[] = [];
        const unvisited = [...points];

        // Ponto inicial: startPoint ou o primeiro da lista (se não fornecido)
        // Se startPoint fornecido, encontramos o mais proximo dele primeiro
        let currentPos = (startLat && startLng) ? { lat: startLat, lng: startLng } : null;

        if (!currentPos && unvisited.length > 0) {
            // Se não tem ponto de partida, pega o primeiro da lista como inicio (arbitrário ou ordem de seleção)
            // Para ser consistente, vamos pegar o primeiro "unvisited" e usar como partida real
            const first = unvisited.shift()!;
            optimizedIds.push(first.id as string);
            currentPos = { lat: first.lat, lng: first.lng };
        }

        while (unvisited.length > 0 && currentPos) {
            // Encontrar o mais próximo do currentPos
            let nearestIdx = -1;
            let minDist = Infinity;

            for (let i = 0; i < unvisited.length; i++) {
                const dist = calculateDistance(currentPos, { lat: unvisited[i].lat, lng: unvisited[i].lng });
                if (dist < minDist) {
                    minDist = dist;
                    nearestIdx = i;
                }
            }

            if (nearestIdx !== -1) {
                const nearest = unvisited[nearestIdx];
                optimizedIds.push(nearest.id as string);
                currentPos = { lat: nearest.lat, lng: nearest.lng };
                unvisited.splice(nearestIdx, 1);
            } else {
                break;
            }
        }

        // Adiciona de volta qualquer ID que não tinha coordenada no final da lista
        const idsWithCoords = new Set(points.map(p => p.id));
        const idsWithoutCoords = workOrderIds.filter(id => !idsWithCoords.has(id));

        return [...optimizedIds, ...idsWithoutCoords];
    }
};
