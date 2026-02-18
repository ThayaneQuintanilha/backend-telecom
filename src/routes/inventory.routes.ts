import { Router } from 'express';
import { inventoryController } from '../controllers/inventory.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// ── Warehouses ──
router.get('/warehouses', inventoryController.listWarehouses);
router.post('/warehouses', inventoryController.createWarehouse);
router.put('/warehouses/:id', inventoryController.updateWarehouse);
router.delete('/warehouses/:id', inventoryController.deleteWarehouse);

// ── Storerooms ──
router.get('/storerooms', inventoryController.listStorerooms);
router.post('/storerooms', inventoryController.createStoreroom);
router.put('/storerooms/:id', inventoryController.updateStoreroom);
router.delete('/storerooms/:id', inventoryController.deleteStoreroom);

// ── Categories ──
router.get('/categories', inventoryController.listCategories);
router.post('/categories', inventoryController.createCategory);
router.put('/categories/:id', inventoryController.updateCategory);
router.delete('/categories/:id', inventoryController.deleteCategory);

// ── Suppliers ──
router.get('/suppliers', inventoryController.listSuppliers);
router.post('/suppliers', inventoryController.createSupplier);
router.put('/suppliers/:id', inventoryController.updateSupplier);
router.delete('/suppliers/:id', inventoryController.deleteSupplier);

// ── Products ──
router.get('/products', inventoryController.listProducts);
router.get('/products/:id', inventoryController.getProductById);
router.post('/products', inventoryController.createProduct);
router.put('/products/:id', inventoryController.updateProduct);
router.delete('/products/:id', inventoryController.deleteProduct);

// ── Assets (Patrimônio) ──
router.get('/assets', inventoryController.listAssets);
router.post('/assets', inventoryController.createAsset);
router.put('/assets/:id', inventoryController.updateAsset);
router.delete('/assets/:id', inventoryController.deleteAsset);

// ── Kits ──
router.get('/kits', inventoryController.listKits);
router.post('/kits', inventoryController.createKit);
router.put('/kits/:id', inventoryController.updateKit);
router.delete('/kits/:id', inventoryController.deleteKit);

// ── Stock & Movements ──
router.get('/stock', inventoryController.getStock);
router.get('/movements', inventoryController.listMovements);
router.post('/movements', inventoryController.registerMovement);

// ── Inventory Count (Balanço) ──
router.get('/counts', inventoryController.listCounts);
router.post('/counts', inventoryController.createCount);
router.get('/counts/:id', inventoryController.getCountById);
router.put('/counts/:id', inventoryController.updateCount);
router.post('/counts/:id/finalize', inventoryController.finalizeCount);

// ── Requests (Solicitações) ──
router.get('/requests', inventoryController.listRequests);
router.post('/requests', inventoryController.createRequest);
router.put('/requests/:id', inventoryController.updateRequest);
router.post('/requests/:id/approve', inventoryController.approveRequest);

export default router;
