import { Router } from 'express';
import { reportsController } from '../controllers/reportsController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { upload } from '../middleware/upload.js';
import { createIncidentSchema } from '../validators/incidentValidators.js';

const router = Router();

router.use(authenticate);

router.get('/my-reports', reportsController.getMyReports);
router.get('/:id', reportsController.getReportById);
router.post('/', validate(createIncidentSchema), reportsController.createReport);
router.post('/upload-photo', upload.single('photo'), reportsController.uploadPhoto);

export default router;
