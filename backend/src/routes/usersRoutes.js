import { Router } from 'express';
import { usersController } from '../controllers/usersController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { createUserSchema, updateUserRoleSchema, toggleUserStatusSchema } from '../validators/userValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', authorizeRoles('admin', 'manager'), usersController.getUsers);
router.get('/:id', usersController.getUserById);

router.post('/', authorizeRoles('admin'), validate(createUserSchema), usersController.createUser);
router.patch('/:id/role', authorizeRoles('admin'), validate(updateUserRoleSchema), usersController.updateUserRole);
router.patch('/:id/status', authorizeRoles('admin'), validate(toggleUserStatusSchema), usersController.toggleUserStatus);
router.delete('/:id', authorizeRoles('admin'), usersController.deleteUser);

export default router;
