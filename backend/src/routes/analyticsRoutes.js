import { Router } from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);

router.get('/overview', authorizeRoles('admin'), analyticsController.getPlatformOverview);
router.get('/manager', authorizeRoles('manager', 'admin'), analyticsController.getManagerMetrics);
router.get('/trends', authorizeRoles('manager', 'admin'), analyticsController.getResolutionTrends);
router.get('/category-distribution', authorizeRoles('manager', 'admin'), analyticsController.getCategoryDistribution);
router.get('/department-performance', authorizeRoles('admin'), analyticsController.getDepartmentPerformance);

export default router;
