import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import { authController } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { registerSchema, staffRegisterSchema, managerRegisterSchema, loginSchema, updateProfileSchema } from '../validators/authValidators.js';

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per window
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP, please try again in 15 minutes.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

const router = Router();

// Public department lookup for registration dropdowns
router.get('/departments', authController.getPublicDepartments);

// Citizen registration (standard public registration)
router.post('/register', authLimiter, validate(registerSchema), authController.register);
router.post('/citizen/register', authLimiter, validate(registerSchema), authController.register);

// Role-specific authorized onboarding
router.post('/staff/register', authLimiter, validate(staffRegisterSchema), authController.registerStaff);
router.post('/manager/register', authLimiter, validate(managerRegisterSchema), authController.registerManager);
router.post('/admin/register', authLimiter, authController.registerAdmin);

// Standard & role-specific login
router.post('/login', authLimiter, validate(loginSchema), authController.login);
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, validate(updateProfileSchema), authController.updateProfile);
router.post('/logout', authenticate, authController.logout);

export default router;
