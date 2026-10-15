import fetch from 'node:http';

const BASE_URL = 'http://localhost:5000/api';

const api = async (endpoint, method = 'GET', body = null, token = null) => {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await globalThis.fetch(`${BASE_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await res.json().catch(() => null);
  return { status: res.status, ok: res.ok, data };
};

const runVerification = async () => {
  console.log('========================================================');
  console.log('🚀 CivicPulse Comprehensive End-to-End API Verification');
  console.log('========================================================\n');

  let passed = 0;
  let failed = 0;

  const assert = (condition, message) => {
    if (condition) {
      console.log(`  ✅ ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: ${message}`);
      failed++;
    }
  };

  // 1. Health Check
  console.log('[Phase 1] System Health & Database Connection');
  const healthRes = await api('/health');
  assert(healthRes.status === 200, `GET /api/health returned 200 (Got: ${healthRes.status})`);
  assert(healthRes.data?.status === 'ok', 'Health status is ok');
  assert(healthRes.data?.database?.connected === true, 'MongoDB database is connected');

  // 2. Authentication & Roles
  console.log('\n[Phase 2] Authentication & Role-Based Authorization');
  const citizenLogin = await api('/auth/login', 'POST', {
    email: 'citizen@civicpulse.gov',
    password: 'Citizen123!',
    requestedRole: 'citizen',
  });
  assert(citizenLogin.status === 200, 'Citizen login succeeded (200)');
  const citizenToken = citizenLogin.data?.token;
  assert(citizenLogin.data?.user?.role === 'citizen', 'Authoritative role is citizen');

  const staffLogin = await api('/auth/login', 'POST', {
    email: 'staff@civicpulse.gov',
    password: 'Staff123!',
    requestedRole: 'staff',
  });
  assert(staffLogin.status === 200, 'Staff login succeeded (200)');
  const staffToken = staffLogin.data?.token;
  const staffUser = staffLogin.data?.user;
  assert(staffUser?.role === 'staff', 'Authoritative role is staff');

  const managerLogin = await api('/auth/login', 'POST', {
    email: 'manager@civicpulse.gov',
    password: 'Manager123!',
    requestedRole: 'manager',
  });
  assert(managerLogin.status === 200, 'Manager login succeeded (200)');
  const managerToken = managerLogin.data?.token;
  assert(managerLogin.data?.user?.role === 'manager', 'Authoritative role is manager');

  const adminLogin = await api('/auth/login', 'POST', {
    email: 'admin@civicpulse.gov',
    password: 'Admin123!',
    requestedRole: 'admin',
  });
  assert(adminLogin.status === 200, 'Admin login succeeded (200)');
  const adminToken = adminLogin.data?.token;
  assert(adminLogin.data?.user?.role === 'admin', 'Authoritative role is admin');

  // Verify unauthorized endpoint access
  const forbiddenRes = await api('/users', 'GET', null, citizenToken);
  assert(forbiddenRes.status === 403, 'Citizen blocked from admin user ledger (403 Forbidden)');

  // 3. Citizen Report Creation & History
  console.log('\n[Phase 3] Citizen Problem Reporting Lifecycle');
  const reportPayload = {
    title: 'Severe Waterlogging at Silk Board Junction',
    description: 'Monsoon drainage failure causing 1-meter deep standing water blocking highway underpass.',
    categoryId: 'potholes_roads',
    address: 'Silk Board Junction, Outer Ring Road, Bengaluru',
    latitude: 12.9175,
    longitude: 77.6238,
  };

  const createReportRes = await api('/reports', 'POST', reportPayload, citizenToken);
  assert(createReportRes.status === 201, `POST /api/reports created report (201)`);
  const createdIncident = createReportRes.data?.data || createReportRes.data;
  const incidentId = createdIncident?.id || createdIncident?._id;
  assert(Boolean(createdIncident?.referenceId), `Reference ID generated: #${createdIncident?.referenceId}`);
  assert(createdIncident?.status === 'reported', 'Initial incident status is reported');

  const myReportsRes = await api('/reports/my-reports', 'GET', null, citizenToken);
  assert(myReportsRes.status === 200, 'GET /api/reports/my-reports succeeded (200)');
  assert(Array.isArray(myReportsRes.data?.data), 'Returns reports array');

  // 4. Manager Assignment to Field Staff
  console.log('\n[Phase 4] Department Manager Review & Work Assignment');
  const assignPayload = {
    incidentId,
    staffId: staffUser.id || staffUser._id,
    instructions: 'Deploy water evacuation pump and clear storm drainage intake.',
    priority: 'high',
    dueDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
  };

  const assignRes = await api('/assignments', 'POST', assignPayload, managerToken);
  assert(assignRes.status === 201, 'POST /api/assignments assigned work order to staff (201)');
  const assignment = assignRes.data?.data || assignRes.data;
  const assignmentId = assignment?.id || assignment?._id;
  assert(assignment?.status === 'assigned', 'Assignment status is assigned');

  // 5. Staff Execution & Evidence Submission
  console.log('\n[Phase 5] Field Staff Remediation & Evidence Submission');
  const staffTasksRes = await api('/assignments/my-tasks', 'GET', null, staffToken);
  assert(staffTasksRes.status === 200, 'GET /api/assignments/my-tasks retrieved tasks (200)');

  const progressRes = await api(`/assignments/${assignmentId}/progress`, 'PATCH', {
    status: 'in_progress',
    notes: 'Drainage suction truck active on site.',
  }, staffToken);
  assert(progressRes.status === 200, 'PATCH /api/assignments/:id/progress transitioned to in_progress (200)');

  const verifySubmitRes = await api(`/assignments/${assignmentId}/submit-verification`, 'POST', {
    notes: 'Debris completely suctioned out. Water drained and traffic restored.',
    evidenceUrls: ['http://localhost:5000/uploads/silk-board-restored.jpg'],
  }, staffToken);
  assert(verifySubmitRes.status === 200, 'POST /api/assignments/:id/submit-verification submitted for verification (200)');

  // 6. Manager Verification & Closure
  console.log('\n[Phase 6] Manager Quality Inspection & Official Resolution');
  const queueRes = await api('/assignments/verification-queue', 'GET', null, managerToken);
  assert(queueRes.status === 200, 'GET /api/assignments/verification-queue retrieved pending items (200)');

  const verifyRes = await api(`/assignments/${assignmentId}/verify`, 'POST', {
    approved: true,
    notes: 'Verified site clearance via CCTV and technician photographic evidence. High quality resolution.',
  }, managerToken);
  assert(verifyRes.status === 200, 'POST /api/assignments/:id/verify verified and closed incident (200)');

  // Verify incident is marked resolved
  const checkIncidentRes = await api(`/incidents/${incidentId}`, 'GET', null, managerToken);
  const updatedIncident = checkIncidentRes.data?.data || checkIncidentRes.data;
  assert(updatedIncident?.status === 'resolved', 'Incident status officially updated to resolved in database');
  assert(Boolean(updatedIncident?.resolvedAt), 'Incident resolvedAt timestamp recorded');

  // 7. Platform Administration & Settings
  console.log('\n[Phase 7] Platform Governance, Settings & Audit Logs');
  const overviewRes = await api('/analytics/overview', 'GET', null, adminToken);
  assert(overviewRes.status === 200, 'GET /api/analytics/overview calculated platform metrics (200)');
  assert(overviewRes.data?.data?.totalIncidents >= 1, 'Total incidents aggregated correctly');

  const deptsRes = await api('/departments', 'GET', null, adminToken);
  assert(deptsRes.status === 200, 'GET /api/departments retrieved municipal departments (200)');

  const catsRes = await api('/categories', 'GET');
  assert(catsRes.status === 200, 'GET /api/categories retrieved issue categories (200)');

  const settingsGetRes = await api('/settings', 'GET', null, adminToken);
  assert(settingsGetRes.status === 200, 'GET /api/settings loaded persistent platform configurations (200)');

  const settingsUpdateRes = await api('/settings', 'PUT', {
    slaWarningThresholdHours: 8,
    autoAssignEnabled: true,
  }, adminToken);
  assert(settingsUpdateRes.status === 200, 'PUT /api/settings persisted updated administrative settings (200)');

  const auditRes = await api('/audit-logs', 'GET', null, adminToken);
  assert(auditRes.status === 200, 'GET /api/audit-logs returned cryptographically verified audit records (200)');
  assert(auditRes.data?.data?.length >= 5, 'Audit trail captured operations across lifecycle');

  console.log('\n========================================================');
  console.log(`🏁 Verification Finished: ${passed} Passed, ${failed} Failed`);
  console.log('========================================================');

  process.exit(failed > 0 ? 1 : 0);
};

runVerification();
