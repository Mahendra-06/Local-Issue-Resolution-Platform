import { Router } from 'express';
import { incidentsController } from '../controllers/incidentsController.js';
import { authenticate } from '../middleware/auth.js';
import { authorizeRoles } from '../middleware/rbac.js';
import { validate } from '../middleware/validate.js';
import { updateIncidentStatusSchema } from '../validators/incidentValidators.js';

const router = Router();

// Public incidents query
router.get('/public', incidentsController.getPublicIncidents);

// Authenticated incident operations
router.use(authenticate);

router.get('/', authorizeRoles('staff', 'manager', 'admin'), incidentsController.getIncidents);
router.get('/:id', incidentsController.getIncidentById);
router.get('/:id/timeline', incidentsController.getIncidentTimeline);
router.patch(
  '/:id/status',
  authorizeRoles('manager', 'admin'),
  validate(updateIncidentStatusSchema),
  incidentsController.updateIncidentStatus
);

export default router;
