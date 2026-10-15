import { Router } from 'express';
import { auditController } from '../controllers/auditController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/', auditController.getAuditLogs);
router.get('/:id', auditController.getAuditLogById);

export default router;
