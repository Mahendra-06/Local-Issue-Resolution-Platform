import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Incident } from '../src/models/Incident.js';
import { Assignment } from '../src/models/Assignment.js';

describe('CivicPulse Backend API Test Suite', () => {
  let citizenToken = '';
  let staffToken = '';
  let managerToken = '';
  let adminToken = '';
  let testIncidentId = '';
  let testAssignmentId = '';

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
  });

  after(async () => {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  test('GET /api/health returns healthy database status', async () => {
    const res = await request(app).get('/api/health');
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.status, 'ok');
    assert.strictEqual(res.body.database.connected, true);
  });

  describe('1. Authentication & Role-Based Authorization', () => {
    test('POST /api/auth/login succeeds with valid citizen credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'citizen@civicpulse.gov',
          password: 'Citizen123!',
          requestedRole: 'citizen',
        });

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.token, 'Token should be present');
      assert.strictEqual(res.body.user.role, 'citizen');
      citizenToken = res.body.token;
    });

    test('POST /api/auth/login succeeds with valid staff credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'staff@civicpulse.gov',
          password: 'Staff123!',
          requestedRole: 'staff',
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.user.role, 'staff');
      staffToken = res.body.token;
    });

    test('POST /api/auth/login succeeds with valid manager credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'manager@civicpulse.gov',
          password: 'Manager123!',
          requestedRole: 'manager',
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.user.role, 'manager');
      managerToken = res.body.token;
    });

    test('POST /api/auth/login succeeds with valid admin credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'admin@civicpulse.gov',
          password: 'Admin123!',
          requestedRole: 'admin',
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.user.role, 'admin');
      adminToken = res.body.token;
    });

    test('POST /api/auth/login fails with invalid credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'citizen@civicpulse.gov',
          password: 'WrongPassword!',
        });

      assert.strictEqual(res.status, 401);
      assert.strictEqual(res.body.success, false);
    });

    test('POST /api/auth/register prevents duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Duplicate Jane',
          email: 'citizen@civicpulse.gov',
          password: 'Citizen123!',
        });

      assert.strictEqual(res.status, 409);
      assert.strictEqual(res.body.success, false);
    });

    test('GET /api/auth/me returns authenticated user profile', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${citizenToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.user.email, 'citizen@civicpulse.gov');
    });

    test('Access without token is rejected with 401', async () => {
      const res = await request(app).get('/api/reports/my-reports');
      assert.strictEqual(res.status, 401);
    });

    test('Citizen forbidden from administrative user management (403)', async () => {
      const res = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${citizenToken}`);

      assert.strictEqual(res.status, 403);
    });
  });

  describe('2. Problem Reporting & Citizen Lifecycle', () => {
    test('POST /api/reports creates a new report with validated coordinates', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          title: 'Deep Pothole on Residency Road',
          description: 'A dangerous pothole near the bus stop damaging vehicle suspension.',
          categoryId: 'potholes_roads',
          address: 'Residency Road, Ashok Nagar, Bengaluru',
          latitude: 12.9716,
          longitude: 77.5946,
        });

      assert.strictEqual(res.status, 201);
      assert.ok(res.body.referenceId);
      assert.strictEqual(res.body.status, 'reported');
      testIncidentId = res.body.id || res.body._id;
    });

    test('POST /api/reports rejects invalid short title/description', async () => {
      const res = await request(app)
        .post('/api/reports')
        .set('Authorization', `Bearer ${citizenToken}`)
        .send({
          title: 'Bad',
          description: 'Short',
          categoryId: 'potholes_roads',
          address: 'Road',
          latitude: 12.9716,
          longitude: 77.5946,
        });

      assert.strictEqual(res.status, 400);
      assert.strictEqual(res.body.success, false);
    });

    test('GET /api/reports/my-reports returns submitted reports', async () => {
      const res = await request(app)
        .get('/api/reports/my-reports')
        .set('Authorization', `Bearer ${citizenToken}`);

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 1);
    });

    test('GET /api/reports/:id retrieves single report details', async () => {
      const res = await request(app)
        .get(`/api/reports/${testIncidentId}`)
        .set('Authorization', `Bearer ${citizenToken}`);

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.title, 'Deep Pothole on Residency Road');
      assert.ok(res.body.timeline && res.body.timeline.length > 0);
    });
  });

  describe('3. Manager Assignment & Field Staff Operations', () => {
    let staffUser;

    before(async () => {
      staffUser = await User.findOne({ email: 'staff@civicpulse.gov' });
    });

    test('POST /api/assignments assigns task to field staff', async () => {
      const res = await request(app)
        .post('/api/assignments')
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          incidentId: testIncidentId,
          staffId: staffUser._id.toString(),
          instructions: 'Fill with grade-1 bitumen gravel and compact thoroughly.',
          priority: 'high',
        });

      assert.strictEqual(res.status, 201);
      assert.strictEqual(res.body.status, 'assigned');
      testAssignmentId = res.body.id || res.body._id;
    });

    test('GET /api/assignments/my-tasks returns assigned task to staff', async () => {
      const res = await request(app)
        .get('/api/assignments/my-tasks')
        .set('Authorization', `Bearer ${staffToken}`);

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      const found = res.body.data.find((t) => (t.id || t._id) === testAssignmentId);
      assert.ok(found, 'Task should appear in staff queue');
    });

    test('PATCH /api/assignments/:id/progress updates work to in_progress', async () => {
      const res = await request(app)
        .patch(`/api/assignments/${testAssignmentId}/progress`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          status: 'in_progress',
          notes: 'Team arrived on site and deployed safety cones.',
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'in_progress');
    });

    test('POST /api/assignments/:id/submit-verification submits task for review', async () => {
      const res = await request(app)
        .post(`/api/assignments/${testAssignmentId}/submit-verification`)
        .set('Authorization', `Bearer ${staffToken}`)
        .send({
          notes: 'Asphalt paving completed and compacted. Road surface restored.',
          evidenceUrls: ['http://localhost:5000/uploads/evidence-sample.jpg'],
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'pending_verification');
    });

    test('GET /api/assignments/verification-queue lists task for manager review', async () => {
      const res = await request(app)
        .get('/api/assignments/verification-queue')
        .set('Authorization', `Bearer ${managerToken}`);

      assert.strictEqual(res.status, 200);
      const inQueue = res.body.data.some((i) => (i.id || i._id) === testAssignmentId);
      assert.ok(inQueue, 'Task should be in manager verification queue');
    });

    test('POST /api/assignments/:id/verify approves and marks resolved', async () => {
      const res = await request(app)
        .post(`/api/assignments/${testAssignmentId}/verify`)
        .set('Authorization', `Bearer ${managerToken}`)
        .send({
          approved: true,
          notes: 'Inspected completed road work. Quality meets standard specifications. Incident closed.',
        });

      assert.strictEqual(res.status, 200);
      assert.strictEqual(res.body.status, 'resolved');

      // Verify incident is also resolved
      const incRes = await request(app)
        .get(`/api/incidents/${testIncidentId}`)
        .set('Authorization', `Bearer ${managerToken}`);
      assert.strictEqual(incRes.body.status, 'resolved');
    });
  });

  describe('4. Platform Analytics & Administration', () => {
    test('GET /api/analytics/overview returns aggregated platform metrics', async () => {
      const res = await request(app)
        .get('/api/analytics/overview')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.ok(res.body.totalUsers >= 4);
      assert.ok(res.body.totalIncidents >= 1);
      assert.ok(res.body.resolutionRate !== undefined);
    });

    test('GET /api/analytics/trends returns daily series for Recharts', async () => {
      const res = await request(app)
        .get('/api/analytics/trends?timeframe=30d')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.strictEqual(res.body.data.length, 30);
      assert.ok('reported' in res.body.data[0]);
      assert.ok('resolved' in res.body.data[0]);
    });

    test('GET /api/analytics/category-distribution returns category breakdown', async () => {
      const res = await request(app)
        .get('/api/analytics/category-distribution')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
    });

    test('GET /api/departments returns municipal departments', async () => {
      const res = await request(app)
        .get('/api/departments')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 1);
    });

    test('GET /api/categories returns system categories with SLA hours', async () => {
      const res = await request(app).get('/api/categories');
      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 1);
    });

    test('GET /api/audit-logs returns platform audit events to admin', async () => {
      const res = await request(app)
        .get('/api/audit-logs')
        .set('Authorization', `Bearer ${adminToken}`);

      assert.strictEqual(res.status, 200);
      assert.ok(Array.isArray(res.body.data));
      assert.ok(res.body.data.length >= 1);
    });
  });
});
