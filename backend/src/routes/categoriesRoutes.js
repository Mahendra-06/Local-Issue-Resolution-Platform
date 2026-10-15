import { Router } from 'express';
import { categoriesController } from '../controllers/categoriesController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { categorySchema } from '../validators/categoryValidators.js';

const router = Router();

router.get('/', categoriesController.getCategories);
router.get('/:id', categoriesController.getCategoryById);

router.post('/', authenticate, authorizeRoles('admin'), validate(categorySchema), categoriesController.createCategory);
router.put('/:id', authenticate, authorizeRoles('admin'), validate(categorySchema), categoriesController.updateCategory);
router.delete('/:id', authenticate, authorizeRoles('admin'), categoriesController.deleteCategory);

export default router;
