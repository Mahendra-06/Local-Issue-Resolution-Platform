import { test, describe, before, after } from 'node:test';
import assert from 'node:assert';
import request from 'supertest';
import mongoose from 'mongoose';
import { app } from '../src/app.js';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Department } from '../src/models/Department.js';

describe('Role-Specific Registration & Authentication Suite', () => {
  let sampleDepartmentId = '';

  before(async () => {
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }
    const dept = await Department.findOne({ isActive: true });
    if (dept) {
      sampleDepartmentId = dept._id.toString();
    }
  });

  after(async () => {
    // Clean up test users
    await User.deleteMany({
      email: {
        $in: [
          'test.citizen.new@civicpulse.org',
          'test.staff.new@civicpulse.org',
          'test.manager.new@civicpulse.org',
        ],
      },
    });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
  });

  test('GET /api/auth/departments returns active departments for registration selector', async () => {
    const res = await request(app).get('/api/auth/departments');
    assert.strictEqual(res.status, 200);
    assert.ok(Array.isArray(res.body.departments));
    assert.ok(res.body.departments.length > 0);
  });

  test('POST /api/auth/citizen/register creates citizen account with ward', async () => {
    const res = await request(app)
      .post('/api/auth/citizen/register')
      .send({
        name: 'Jane Citizen',
        email: 'test.citizen.new@civicpulse.org',
        password: 'Password123!',
        phone: '+1555-0199',
        ward: 'Ward 12, West End, Greenfield District',
      });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.role, 'citizen');
    assert.strictEqual(res.body.user.ward, 'Ward 12, West End, Greenfield District');
  });

  test('POST /api/auth/staff/register rejects request with invalid authorization code', async () => {
    const res = await request(app)
      .post('/api/auth/staff/register')
      .send({
        name: 'Staff Unauthorized',
        email: 'unauth.staff@civicpulse.org',
        password: 'Password123!',
        departmentId: sampleDepartmentId,
        authorizationCode: 'INVALID-CODE-999',
      });

    assert.strictEqual(res.status, 403);
    assert.match(res.body.message, /Invalid staff authorization/);
  });

  test('POST /api/auth/staff/register provisions staff account with valid code and department', async () => {
    const res = await request(app)
      .post('/api/auth/staff/register')
      .send({
        name: 'Alex Staff',
        email: 'test.staff.new@civicpulse.org',
        password: 'Password123!',
        phone: '+1555-0144',
        employeeId: 'EMP-PW-4402',
        departmentId: sampleDepartmentId,
        authorizationCode: 'STAFF-AUTH-2026',
      });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.role, 'staff');
    assert.strictEqual(res.body.user.employeeId, 'EMP-PW-4402');
  });

  test('POST /api/auth/manager/register rejects request with invalid authorization code', async () => {
    const res = await request(app)
      .post('/api/auth/manager/register')
      .send({
        name: 'Manager Unauthorized',
        email: 'unauth.mgr@civicpulse.org',
        password: 'Password123!',
        departmentId: sampleDepartmentId,
        authorizationCode: 'WRONG-MGR-CODE',
      });

    assert.strictEqual(res.status, 403);
    assert.match(res.body.message, /Invalid administrator authorization code/);
  });

  test('POST /api/auth/manager/register provisions manager account with valid code', async () => {
    const res = await request(app)
      .post('/api/auth/manager/register')
      .send({
        name: 'Morgan Manager',
        email: 'test.manager.new@civicpulse.org',
        password: 'Password123!',
        phone: '+1555-0188',
        departmentId: sampleDepartmentId,
        authorizationCode: 'MGR-AUTH-2026',
      });

    assert.strictEqual(res.status, 201);
    assert.ok(res.body.token);
    assert.strictEqual(res.body.user.role, 'manager');
  });

  test('POST /api/auth/admin/register strictly blocks public administrator registration', async () => {
    const res = await request(app)
      .post('/api/auth/admin/register')
      .send({
        name: 'Hacker Admin',
        email: 'hacker@civicpulse.org',
        password: 'Password123!',
      });

    assert.strictEqual(res.status, 403);
    assert.match(res.body.message, /Public administrator registration is prohibited/);
  });
});
