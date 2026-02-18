import { WarehouseModel, IWarehouse } from '../models/inventory/Warehouse.model';
import { StoreroomModel, IStoreroom } from '../models/inventory/Storeroom.model';
import { CategoryModel, ICategory } from '../models/inventory/Category.model';
import { SupplierModel, ISupplier } from '../models/inventory/Supplier.model';
import { ProductModel, IProduct } from '../models/inventory/Product.model';
import { AssetModel, IAsset } from '../models/inventory/Asset.model';
import { KitModel, IKit } from '../models/inventory/Kit.model';
import { StockLevelModel } from '../models/inventory/StockLevel.model';
import { InventoryMovementModel, IInventoryMovement } from '../models/inventory/InventoryMovement.model';
import { InventoryCountModel, IInventoryCount } from '../models/inventory/InventoryCount.model';
import { InventoryRequestModel, IInventoryRequest } from '../models/inventory/InventoryRequest.model';
import { AppError } from '../middlewares/errorHandler.middleware';
import { Types } from 'mongoose';

// ============================================================
// inventoryService — Serviço unificado de estoque
// ============================================================

export const inventoryService = {
    // ── Warehouses ─────────────────────────────────────────────
    async listWarehouses(tenantId: string) {
        return WarehouseModel.find({ tenantId: new Types.ObjectId(tenantId), active: true }).sort({ name: 1 }).lean();
    },
    async createWarehouse(tenantId: string, data: Partial<IWarehouse>) {
        const existing = await WarehouseModel.findOne({ tenantId, name: data.name, active: true });
        if (existing) throw new AppError('Já existe um armazém com este nome', 409);
        return WarehouseModel.create({ ...data, tenantId });
    },
    async updateWarehouse(tenantId: string, id: string, data: Partial<IWarehouse>) {
        return WarehouseModel.findOneAndUpdate({ _id: id, tenantId }, { $set: data }, { new: true });
    },
    async deleteWarehouse(tenantId: string, id: string) {
        return WarehouseModel.findOneAndUpdate({ _id: id, tenantId }, { $set: { active: false } }, { new: true });
    },

    // ── Storerooms ─────────────────────────────────────────────
    async listStorerooms(tenantId: string) {
        return StoreroomModel.find({ tenantId, active: true })
            .populate('warehouseId', 'name')
            .populate('responsibleId', 'name')
            .sort({ name: 1 })
            .lean();
    },
    async createStoreroom(tenantId: string, data: Partial<IStoreroom>) {
        const existing = await StoreroomModel.findOne({ tenantId, name: data.name, active: true });
        if (existing) throw new AppError('Já existe um almoxarifado com este nome', 409);
        return StoreroomModel.create({ ...data, tenantId });
    },
    async updateStoreroom(tenantId: string, id: string, data: Partial<IStoreroom>) {
        return StoreroomModel.findOneAndUpdate({ _id: id, tenantId }, { $set: data }, { new: true });
    },
    async deleteStoreroom(tenantId: string, id: string) {
        return StoreroomModel.findOneAndUpdate({ _id: id, tenantId }, { $set: { active: false } }, { new: true });
    },

    // ── Categories ─────────────────────────────────────────────
    async listCategories(tenantId: string) {
        return CategoryModel.find({ tenantId, active: true }).sort({ name: 1 }).lean();
    },
    async createCategory(tenantId: string, data: Partial<ICategory>) {
        const existing = await CategoryModel.findOne({ tenantId, name: data.name, active: true });
        if (existing) throw new AppError('Categoria já existe', 409);
        return CategoryModel.create({ ...data, tenantId });
    },
    async updateCategory(tenantId: string, id: string, data: Partial<ICategory>) {
        return CategoryModel.findOneAndUpdate({ _id: id, tenantId }, { $set: data }, { new: true });
    },
    async deleteCategory(tenantId: string, id: string) {
        return CategoryModel.findOneAndUpdate({ _id: id, tenantId }, { $set: { active: false } }, { new: true });
    },

    // ── Suppliers ──────────────────────────────────────────────
    async listSuppliers(tenantId: string) {
        return SupplierModel.find({ tenantId, active: true }).sort({ name: 1 }).lean();
    },
    async createSupplier(tenantId: string, data: Partial<ISupplier>) {
        return SupplierModel.create({ ...data, tenantId });
    },
    async updateSupplier(tenantId: string, id: string, data: Partial<ISupplier>) {
        return SupplierModel.findOneAndUpdate({ _id: id, tenantId }, { $set: data }, { new: true });
    },
    async deleteSupplier(tenantId: string, id: string) {
        return SupplierModel.findOneAndUpdate({ _id: id, tenantId }, { $set: { active: false } }, { new: true });
    },

    // ── Products ───────────────────────────────────────────────
    async listProducts({ tenantId, page = 1, limit = 20, search, categoryId, supplierId }: any) {
        const filter: any = { tenantId: new Types.ObjectId(tenantId), active: true };
        if (search) {
            filter.$or = [
                { name: { $regex: search, $options: 'i' } },
                { partNumber: { $regex: search, $options: 'i' } }
            ];
        }
        if (categoryId) filter.categoryId = new Types.ObjectId(categoryId);
        if (supplierId) filter.supplierId = new Types.ObjectId(supplierId);

        const skip = (Number(page) - 1) * Number(limit);
        const [products, total] = await Promise.all([
            ProductModel.find(filter).populate('categoryId', 'name').populate('supplierId', 'name')
                .skip(skip).limit(Number(limit)).sort({ name: 1 }).lean(),
            ProductModel.countDocuments(filter)
        ]);
        return { products, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
    },
    async getProductById(tenantId: string, id: string) {
        const product = await ProductModel.findOne({ _id: id, tenantId, active: true })
            .populate('categoryId', 'name').populate('supplierId', 'name').lean();
        if (!product) throw new AppError('Produto não encontrado', 404);
        return product;
    },
    async createProduct(tenantId: string, data: Partial<IProduct>) {
        // Sanitize optional ObjectIds
        const payload = { ...data };
        if (payload.supplierId === '' as any) delete payload.supplierId;
        if (payload.categoryId === '' as any) delete payload.categoryId;
        if (!payload.images) payload.images = [];

        return ProductModel.create({ ...payload, tenantId });
    },
    async updateProduct(tenantId: string, id: string, data: Partial<IProduct>) {
        const payload = { ...data };
        if (payload.supplierId === '' as any) payload.supplierId = undefined; // Unset

        return ProductModel.findOneAndUpdate({ _id: id, tenantId }, { $set: payload }, { new: true });
    },
    async deleteProduct(tenantId: string, id: string) {
        return ProductModel.findOneAndUpdate({ _id: id, tenantId }, { $set: { active: false } }, { new: true });
    },

    // ── Assets ─────────────────────────────────────────────────
    async listAssets({ tenantId, page = 1, limit = 20, search, status, locationType, locationId }: any) {
        const filter: any = { tenantId: new Types.ObjectId(tenantId), active: true };
        if (search) {
            filter.$or = [
                { serialNumber: { $regex: search, $options: 'i' } },
                { trackingCode: { $regex: search, $options: 'i' } }
            ];
        }
        if (status) filter.status = status;
        if (locationType) filter.locationType = locationType;
        if (locationId) filter.locationId = new Types.ObjectId(locationId);

        const skip = (Number(page) - 1) * Number(limit);
        const [assets, total] = await Promise.all([
            AssetModel.find(filter).populate('productId', 'name partNumber')
                .skip(skip).limit(Number(limit)).sort({ updatedAt: -1 }).lean(),
            AssetModel.countDocuments(filter)
        ]);
        return { assets, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
    },
    async createAsset(tenantId: string, data: Partial<IAsset>) {
        const existing = await AssetModel.findOne({ tenantId, serialNumber: data.serialNumber, active: true });
        if (existing) throw new AppError(`O serial ${data.serialNumber} já existe`, 409);
        return AssetModel.create({ ...data, tenantId });
    },
    async updateAsset(tenantId: string, id: string, data: Partial<IAsset>) {
        return AssetModel.findOneAndUpdate({ _id: id, tenantId }, { $set: data }, { new: true });
    },
    async deleteAsset(tenantId: string, id: string) {
        return AssetModel.findOneAndUpdate({ _id: id, tenantId }, { $set: { active: false } }, { new: true });
    },

    // ── Kits ───────────────────────────────────────────────────
    async listKits(tenantId: string) {
        return KitModel.find({ tenantId, active: true }).populate('items.productId', 'name').sort({ name: 1 }).lean();
    },
    async createKit(tenantId: string, data: Partial<IKit>) {
        const existing = await KitModel.findOne({ tenantId, name: data.name, active: true });
        if (existing) throw new AppError('Kit já existe', 409);
        return KitModel.create({ ...data, tenantId });
    },
    async updateKit(tenantId: string, id: string, data: Partial<IKit>) {
        return KitModel.findOneAndUpdate({ _id: id, tenantId }, { $set: data }, { new: true });
    },
    async deleteKit(tenantId: string, id: string) {
        return KitModel.findOneAndUpdate({ _id: id, tenantId }, { $set: { active: false } }, { new: true });
    },

    // ── StockLevel & Movements (Core) ──────────────────────────
    async getStock(tenantId: string, locationType: string, locationId: string) {
        return StockLevelModel.find({
            tenantId: new Types.ObjectId(tenantId),
            locationType,
            locationId: new Types.ObjectId(locationId)
        }).populate('productId', 'name partNumber unit').lean();
    },

    async registerMovement(tenantId: string, data: Partial<IInventoryMovement>) {
        const session = await WarehouseModel.startSession();
        let movement;
        await session.withTransaction(async () => {
            movement = await InventoryMovementModel.create([{ ...data, tenantId }], { session });
            const mov = movement[0];

            // Atualizar Origem (OUT)
            if (mov.sourceLocationId && mov.sourceLocationType) {
                await StockLevelModel.updateOne(
                    { tenantId, locationType: mov.sourceLocationType, locationId: mov.sourceLocationId, productId: mov.productId },
                    { $inc: { quantity: -mov.quantity } },
                    { upsert: true, session }
                );
            }

            // Atualizar Destino (IN)
            if (mov.targetLocationId && mov.targetLocationType) {
                await StockLevelModel.updateOne(
                    { tenantId, locationType: mov.targetLocationType, locationId: mov.targetLocationId, productId: mov.productId },
                    { $inc: { quantity: mov.quantity } },
                    { upsert: true, session }
                );
            }
        });
        session.endSession();
        return movement ? movement[0] : null;
    },

    async listMovements({ tenantId, page = 1, limit = 20, productId, locationId }: any) {
        const filter: any = { tenantId: new Types.ObjectId(tenantId) };
        if (productId) filter.productId = new Types.ObjectId(productId);
        if (locationId) {
            filter.$or = [
                { sourceLocationId: new Types.ObjectId(locationId) },
                { targetLocationId: new Types.ObjectId(locationId) }
            ];
        }

        const skip = (Number(page) - 1) * Number(limit);
        const [movements, total] = await Promise.all([
            InventoryMovementModel.find(filter)
                .populate('productId', 'name')
                .populate('userId', 'name')
                .sort({ createdAt: -1 })
                .skip(skip).limit(Number(limit)).lean(),
            InventoryMovementModel.countDocuments(filter)
        ]);
        return { movements, total, page: Number(page), totalPages: Math.ceil(total / Number(limit)) };
    },

    // ── Inventory Counts (Balanço) ─────────────────────────────
    async listCounts(tenantId: string) {
        return InventoryCountModel.find({ tenantId, active: true }).sort({ createdAt: -1 }).lean();
    },
    async createCount(tenantId: string, data: Partial<IInventoryCount>) {
        return InventoryCountModel.create({ ...data, tenantId });
    },
    async getCountById(tenantId: string, id: string) {
        return InventoryCountModel.findOne({ _id: id, tenantId }).populate('items.productId', 'name').lean();
    },
    async updateCount(tenantId: string, id: string, data: Partial<IInventoryCount>) {
        return InventoryCountModel.findOneAndUpdate({ _id: id, tenantId }, { $set: data }, { new: true });
    },
    async finalizeCount(tenantId: string, id: string, userId: string) {
        const count = await InventoryCountModel.findOne({ _id: id, tenantId });
        if (!count || count.status === 'COMPLETED') throw new AppError('Contagem inválida ou já finalizada', 400);

        const session = await WarehouseModel.startSession();
        await session.withTransaction(async () => {
            for (const item of count.items) {
                if (item.diff && item.diff !== 0) {
                    // Gerar movimento de ajuste
                    const type = item.diff > 0 ? 'IN' : 'OUT';
                    await InventoryMovementModel.create([{
                        tenantId,
                        type: 'ADJUSTMENT',
                        productId: item.productId,
                        quantity: Math.abs(item.diff),
                        targetLocationType: type === 'IN' ? count.locationType : undefined,
                        targetLocationId: type === 'IN' ? count.locationId : undefined,
                        sourceLocationType: type === 'OUT' ? count.locationType : undefined,
                        sourceLocationId: type === 'OUT' ? count.locationId : undefined,
                        referenceType: 'InventoryCount',
                        referenceId: count._id,
                        userId,
                        notes: `Ajuste de inventário: ${item.notes || 'Diferença identificada'}`
                    }], { session });

                    // Atualizar StockLevel
                    await StockLevelModel.updateOne(
                        { tenantId, locationType: count.locationType, locationId: count.locationId, productId: item.productId },
                        { $set: { quantity: item.countedStock, lastCountDate: new Date() } }, // Força o valor contado
                        { upsert: true, session }
                    );
                }
            }

            count.status = 'COMPLETED';
            count.finalizedAt = new Date();
            await count.save({ session });
        });
        session.endSession();
        return count;
    },

    // ── Inventory Requests (Solicitações) ──────────────────────
    async listRequests(tenantId: string) {
        return InventoryRequestModel.find({ tenantId, active: true })
            .populate('requesterId', 'name')
            .sort({ createdAt: -1 })
            .lean();
    },
    async createRequest(tenantId: string, data: Partial<IInventoryRequest>) {
        return InventoryRequestModel.create({ ...data, tenantId });
    },
    async updateRequest(tenantId: string, id: string, data: Partial<IInventoryRequest>) {
        return InventoryRequestModel.findOneAndUpdate({ _id: id, tenantId }, { $set: data }, { new: true });
    },
    async approveRequest(tenantId: string, id: string, approverId: string) {
        const req = await InventoryRequestModel.findOne({ _id: id, tenantId });
        if (!req || req.status !== 'PENDING') throw new AppError('Solicitação inválida', 400);

        const session = await WarehouseModel.startSession();
        await session.withTransaction(async () => {
            for (const item of req.items) {
                const qtd = item.approvedQuantity || item.quantity;
                if (qtd > 0) {
                    // Transferência ou Saída
                    await InventoryMovementModel.create([{
                        tenantId,
                        type: req.type === 'RETURN' ? 'IN' : 'OUT', // Se for deploy/restock é OUT da origem
                        productId: item.productId,
                        quantity: qtd,
                        sourceLocationType: req.sourceLocationType,
                        sourceLocationId: req.sourceLocationId,
                        targetLocationType: req.targetLocationType,
                        targetLocationId: req.targetLocationId,
                        referenceType: 'Request',
                        referenceId: req._id,
                        userId: approverId
                    }], { session });

                    // Atualiza saldos
                    if (req.sourceLocationId) {
                        await StockLevelModel.updateOne(
                            { tenantId, locationType: req.sourceLocationType, locationId: req.sourceLocationId, productId: item.productId },
                            { $inc: { quantity: -qtd } },
                            { upsert: true, session }
                        );
                    }
                    if (req.targetLocationId) {
                        await StockLevelModel.updateOne(
                            { tenantId, locationType: req.targetLocationType, locationId: req.targetLocationId, productId: item.productId },
                            { $inc: { quantity: qtd } },
                            { upsert: true, session }
                        );
                    }
                }
            }
            req.status = 'APPROVED'; // Ou FULFILLED direto
            req.approvedBy = new Types.ObjectId(approverId);
            req.approvedAt = new Date();
            await req.save({ session });
        });
        session.endSession();
        return req;
    }
};
