import { Response, NextFunction } from 'express';
import { inventoryService } from '../services/inventory.service';
import { AuthRequest } from '../middlewares/auth.middleware';

// ============================================================
// inventoryController — Endpoints de Estoque
// ============================================================

export const inventoryController = {
    // ── Warehouses ─────────────────────────────────────────────
    async listWarehouses(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.listWarehouses(tenantId);
            res.json(data);
        } catch (err) { next(err); }
    },
    async createWarehouse(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.createWarehouse(tenantId, req.body);
            res.status(201).json(data);
        } catch (err) { next(err); }
    },
    async updateWarehouse(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.updateWarehouse(tenantId, req.params.id as string, req.body);
            res.json(data);
        } catch (err) { next(err); }
    },
    async deleteWarehouse(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            await inventoryService.deleteWarehouse(tenantId, req.params.id as string);
            res.status(204).send();
        } catch (err) { next(err); }
    },

    // ── Storerooms ─────────────────────────────────────────────
    async listStorerooms(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.listStorerooms(tenantId);
            res.json(data);
        } catch (err) { next(err); }
    },
    async createStoreroom(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.createStoreroom(tenantId, req.body);
            res.status(201).json(data);
        } catch (err) { next(err); }
    },
    async updateStoreroom(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.updateStoreroom(tenantId, req.params.id as string, req.body);
            res.json(data);
        } catch (err) { next(err); }
    },
    async deleteStoreroom(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            await inventoryService.deleteStoreroom(tenantId, req.params.id as string);
            res.status(204).send();
        } catch (err) { next(err); }
    },

    // ── Categories ─────────────────────────────────────────────
    async listCategories(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.listCategories(tenantId);
            res.json(data);
        } catch (err) { next(err); }
    },
    async createCategory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.createCategory(tenantId, req.body);
            res.status(201).json(data);
        } catch (err) { next(err); }
    },
    async updateCategory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.updateCategory(tenantId, req.params.id as string, req.body);
            res.json(data);
        } catch (err) { next(err); }
    },
    async deleteCategory(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            await inventoryService.deleteCategory(tenantId, req.params.id as string);
            res.status(204).send();
        } catch (err) { next(err); }
    },

    // ── Suppliers ──────────────────────────────────────────────
    async listSuppliers(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.listSuppliers(tenantId);
            res.json(data);
        } catch (err) { next(err); }
    },
    async createSupplier(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.createSupplier(tenantId, req.body);
            res.status(201).json(data);
        } catch (err) { next(err); }
    },
    async updateSupplier(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.updateSupplier(tenantId, req.params.id as string, req.body);
            res.json(data);
        } catch (err) { next(err); }
    },
    async deleteSupplier(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            await inventoryService.deleteSupplier(tenantId, req.params.id as string);
            res.status(204).send();
        } catch (err) { next(err); }
    },

    // ── Products ───────────────────────────────────────────────
    async listProducts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const { page, limit, search, categoryId, supplierId } = req.query;
            const data = await inventoryService.listProducts({
                tenantId,
                page,
                limit,
                search,
                categoryId,
                supplierId
            });
            res.json(data);
        } catch (err) { next(err); }
    },
    async getProductById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.getProductById(tenantId, req.params.id as string);
            res.json(data);
        } catch (err) { next(err); }
    },
    async createProduct(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.createProduct(tenantId, req.body);
            res.status(201).json(data);
        } catch (err) { next(err); }
    },
    async updateProduct(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.updateProduct(tenantId, req.params.id as string, req.body);
            res.json(data);
        } catch (err) { next(err); }
    },
    async deleteProduct(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            await inventoryService.deleteProduct(tenantId, req.params.id as string);
            res.status(204).send();
        } catch (err) { next(err); }
    },

    // ── Assets (Patrimônio) ────────────────────────────────────
    async listAssets(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const { page, limit, search, status, locationType, locationId } = req.query;
            const data = await inventoryService.listAssets({
                tenantId,
                page,
                limit,
                search,
                status,
                locationType,
                locationId
            });
            res.json(data);
        } catch (err) { next(err); }
    },
    async createAsset(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.createAsset(tenantId, req.body);
            res.status(201).json(data);
        } catch (err) { next(err); }
    },
    async updateAsset(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.updateAsset(tenantId, req.params.id as string, req.body);
            res.json(data);
        } catch (err) { next(err); }
    },
    async deleteAsset(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            await inventoryService.deleteAsset(tenantId, req.params.id as string);
            res.status(204).send();
        } catch (err) { next(err); }
    },

    // ── Kits ───────────────────────────────────────────────────
    async listKits(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.listKits(tenantId);
            res.json(data);
        } catch (err) { next(err); }
    },
    async createKit(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.createKit(tenantId, req.body);
            res.status(201).json(data);
        } catch (err) { next(err); }
    },
    async updateKit(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.updateKit(tenantId, req.params.id as string, req.body);
            res.json(data);
        } catch (err) { next(err); }
    },
    async deleteKit(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            await inventoryService.deleteKit(tenantId, req.params.id as string);
            res.status(204).send();
        } catch (err) { next(err); }
    },

    // ── Stock & Movements ──────────────────────────────────────
    async getStock(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const { locationType, locationId } = req.query;
            if (!locationType || !locationId) throw new Error('Parâmetros locationType e locationId obrigatórios');
            const data = await inventoryService.getStock(tenantId, locationType as string, locationId as string);
            res.json(data);
        } catch (err) { next(err); }
    },
    async registerMovement(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId, _id: userId } = req.user!;
            const data = await inventoryService.registerMovement(tenantId, { ...req.body, userId });
            res.status(201).json(data);
        } catch (err) { next(err); }
    },
    async listMovements(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.listMovements({ ...req.query, tenantId });
            res.json(data);
        } catch (err) { next(err); }
    },

    // ── Inventory Count (Balanço) ──────────────────────────────
    async listCounts(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.listCounts(tenantId);
            res.json(data);
        } catch (err) { next(err); }
    },
    async createCount(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId, _id: userId } = req.user!;
            const data = await inventoryService.createCount(tenantId, { ...req.body, responsibleId: userId });
            res.status(201).json(data);
        } catch (err) { next(err); }
    },
    async getCountById(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.getCountById(tenantId, req.params.id as string);
            res.json(data);
        } catch (err) { next(err); }
    },
    async updateCount(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.updateCount(tenantId, req.params.id as string, req.body);
            res.json(data);
        } catch (err) { next(err); }
    },
    async finalizeCount(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId, _id: userId } = req.user!;
            const data = await inventoryService.finalizeCount(tenantId, req.params.id as string, userId.toString());
            res.json(data);
        } catch (err) { next(err); }
    },

    // ── Requests (Solicitações) ────────────────────────────────
    async listRequests(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.listRequests(tenantId);
            res.json(data);
        } catch (err) { next(err); }
    },
    async createRequest(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId, _id: userId } = req.user!;
            const data = await inventoryService.createRequest(tenantId, { ...req.body, requesterId: userId });
            res.status(201).json(data);
        } catch (err) { next(err); }
    },
    async updateRequest(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId } = req.user!;
            const data = await inventoryService.updateRequest(tenantId, req.params.id as string, req.body);
            res.json(data);
        } catch (err) { next(err); }
    },
    async approveRequest(req: AuthRequest, res: Response, next: NextFunction) {
        try {
            const { tenantId, _id: userId } = req.user!;
            const data = await inventoryService.approveRequest(tenantId, req.params.id as string, userId.toString());
            res.json(data);
        } catch (err) { next(err); }
    },
};
