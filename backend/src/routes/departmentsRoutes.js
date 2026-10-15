import { Router } from 'express';
import { departmentsController } from '../controllers/departmentsController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { departmentSchema } from '../validators/departmentValidators.js';

const router = Router();

router.use(authenticate);

router.get('/', departmentsController.getDepartments);
router.get('/:id', departmentsController.getDepartmentById);
router.get('/:departmentId/staff', departmentsController.getDepartmentStaff);

router.post('/', authorizeRoles('admin'), validate(departmentSchema), departmentsController.createDepartment);
router.put('/:id', authorizeRoles('admin'), validate(departmentSchema), departmentsController.updateDepartment);
router.delete('/:id', authorizeRoles('admin'), departmentsController.deleteDepartment);

export default router;
