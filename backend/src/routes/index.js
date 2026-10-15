import { Router } from 'express';
import mongoose from 'mongoose';
import authRoutes from './authRoutes.js';
import reportsRoutes from './reportsRoutes.js';
import incidentsRoutes from './incidentsRoutes.js';
import assignmentsRoutes from './assignmentsRoutes.js';
import departmentsRoutes from './departmentsRoutes.js';
import usersRoutes from './usersRoutes.js';
import categoriesRoutes from './categoriesRoutes.js';
import notificationsRoutes from './notificationsRoutes.js';
import analyticsRoutes from './analyticsRoutes.js';
import auditRoutes from './auditRoutes.js';
import settingsRoutes from './settingsRoutes.js';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? 'ok' : 'degraded',
    service: 'CivicPulse Backend API',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: states[dbState] || 'unknown',
      connected: isHealthy,
    },
  });
});

// Mount modules
router.use('/auth', authRoutes);
router.use('/reports', reportsRoutes);
router.use('/incidents', incidentsRoutes);
router.use('/assignments', assignmentsRoutes);
router.use('/departments', departmentsRoutes);
router.use('/users', usersRoutes);
router.use('/categories', categoriesRoutes);
router.use('/notifications', notificationsRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/audit-logs', auditRoutes);
router.use('/settings', settingsRoutes);

export default router;
