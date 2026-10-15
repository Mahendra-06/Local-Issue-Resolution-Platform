import { Router } from 'express';
import { settingsController } from '../controllers/settingsController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';

const router = Router();

router.use(authenticate);
router.use(authorizeRoles('admin'));

router.get('/', settingsController.getSettings);
router.put('/', settingsController.updateSettings);

export default router;
