import { Router } from 'express';
import { assignmentsController } from '../controllers/assignmentsController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import {
  assignTaskSchema,
  reassignTaskSchema,
  updateProgressSchema,
  submitVerificationSchema,
  verifyResolutionSchema,
} from '../validators/assignmentValidators.js';

const router = Router();

router.use(authenticate);

// Staff tasks
router.get('/my-tasks', authorizeRoles('staff'), assignmentsController.getStaffTasks);

// Manager verification queue
router.get(
  '/verification-queue',
  authorizeRoles('manager', 'admin'),
  assignmentsController.getVerificationQueue
);

// Evidence upload
router.post('/upload-evidence', upload.single('evidence'), assignmentsController.uploadEvidencePhoto);

// Task details
router.get('/:taskId', assignmentsController.getTaskById);

// Manager assign & reassign
router.post('/', authorizeRoles('manager', 'admin'), validate(assignTaskSchema), assignmentsController.assignTask);
router.patch(
  '/:assignmentId/reassign',
  authorizeRoles('manager', 'admin'),
  validate(reassignTaskSchema),
  assignmentsController.reassignTask
);

// Staff execution updates
router.patch(
  '/:assignmentId/progress',
  authorizeRoles('staff'),
  validate(updateProgressSchema),
  assignmentsController.updateProgress
);
router.post(
  '/:assignmentId/submit-verification',
  authorizeRoles('staff'),
  validate(submitVerificationSchema),
  assignmentsController.submitForVerification
);

// Manager verification / closure
router.post(
  '/:assignmentId/verify',
  authorizeRoles('manager', 'admin'),
  validate(verifyResolutionSchema),
  assignmentsController.verifyResolution
);

export default router;
