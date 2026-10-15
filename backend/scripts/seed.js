import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/db.js';
import { User } from '../src/models/User.js';
import { Department } from '../src/models/Department.js';
import { Category } from '../src/models/Category.js';
import { Incident } from '../src/models/Incident.js';
import { Assignment } from '../src/models/Assignment.js';
import { Notification } from '../src/models/Notification.js';
import { AuditLog } from '../src/models/AuditLog.js';
import { Setting } from '../src/models/Setting.js';
import { generateReferenceId } from '../src/utils/referenceGenerator.js';

const seed = async () => {
  try {
    console.log('[Seed] Connecting to database...');
    await connectDB();

    console.log('[Seed] Clearing existing development data...');
    await Promise.all([
      User.deleteMany({}),
      Department.deleteMany({}),
      Category.deleteMany({}),
      Incident.deleteMany({}),
      Assignment.deleteMany({}),
      Notification.deleteMany({}),
      AuditLog.deleteMany({}),
      Setting.deleteMany({}),
    ]);

    console.log('[Seed] Seeding municipal departments...');
    const departments = await Department.create([
      {
        name: 'Public Works & Roads',
        code: 'PWR',
        description: 'Street maintenance, asphalt paving, sidewalks, and civil structures.',
        serviceArea: 'Central Municipal District',
        contactEmail: 'pwr@city.gov',
      },
      {
        name: 'Electrical & Lighting',
        code: 'EAL',
        description: 'Streetlight maintenance, electrical grids, and public illumination.',
        serviceArea: 'Metro Wide',
        contactEmail: 'lighting@city.gov',
      },
      {
        name: 'Water & Sewage Board',
        code: 'WSB',
        description: 'Potable water pipelines, sewage lines, storm drains, and hydrants.',
        serviceArea: 'Greater Municipal Zone',
        contactEmail: 'water@city.gov',
      },
      {
        name: 'Solid Waste Management',
        code: 'SWM',
        description: 'Garbage collection, litter clearance, and municipal sanitation.',
        serviceArea: 'All City Wards',
        contactEmail: 'waste@city.gov',
      },
    ]);

    const pwrDept = departments[0];
    const lightDept = departments[1];
    const waterDept = departments[2];

    console.log('[Seed] Seeding issue categories & statutory SLAs...');
    const categories = await Category.create([
      {
        key: 'potholes_roads',
        name: 'Roads & Potholes',
        description: 'Damaged pavement, potholes, missing manhole covers, and road hazards.',
        department: 'Public Works & Roads',
        slaHours: 48,
        icon: 'AlertTriangle',
      },
      {
        key: 'street_lighting',
        name: 'Street Lighting',
        description: 'Dark corridors, flickering fixtures, broken lampposts, or exposed wiring.',
        department: 'Electrical & Lighting',
        slaHours: 24,
        icon: 'Lightbulb',
      },
      {
        key: 'water_supply',
        name: 'Water Supply & Leakage',
        description: 'Pipeline bursts, water contamination, low pressure, or open hydrants.',
        department: 'Water & Sewage Board',
        slaHours: 12,
        icon: 'Droplets',
      },
      {
        key: 'sanitation_waste',
        name: 'Sanitation & Waste',
        description: 'Overflowing bins, illegal dumping, uncollected garbage, or biohazard spills.',
        department: 'Solid Waste Management',
        slaHours: 24,
        icon: 'Trash2',
      },
    ]);

    console.log('[Seed] Seeding municipal platform users...');
    const salt = await bcrypt.genSalt(10);
    const citizenPassword = await bcrypt.hash('Citizen123!', salt);
    const staffPassword = await bcrypt.hash('Staff123!', salt);
    const managerPassword = await bcrypt.hash('Manager123!', salt);
    const adminPassword = await bcrypt.hash('Admin123!', salt);

    const users = await User.create([
      {
        name: 'Jane Citizen',
        email: 'citizen@civicpulse.gov',
        passwordHash: citizenPassword,
        role: 'citizen',
        phone: '+91 98765 43210',
        address: '14 MG Road, Bengaluru, Karnataka 560001',
        isActive: true,
      },
      {
        name: 'Devan Field Tech',
        email: 'staff@civicpulse.gov',
        passwordHash: staffPassword,
        role: 'staff',
        phone: '+91 98765 43211',
        departmentId: pwrDept._id,
        departmentName: pwrDept.name,
        address: 'Municipal Depot 4, Bengaluru',
        isActive: true,
      },
      {
        name: 'Rohan Sharma',
        email: 'manager@civicpulse.gov',
        passwordHash: managerPassword,
        role: 'manager',
        phone: '+91 98765 43212',
        departmentId: pwrDept._id,
        departmentName: pwrDept.name,
        address: 'Zonal Office, Public Works & Roads',
        isActive: true,
      },
      {
        name: 'Priya Iyer',
        email: 'admin@civicpulse.gov',
        passwordHash: adminPassword,
        role: 'admin',
        phone: '+91 98765 43213',
        address: 'Municipal Corporation Headquarters',
        isActive: true,
      },
    ]);

    const [citizenUser, staffUser, managerUser, adminUser] = users;

    console.log('[Seed] Seeding demonstration incidents & operational lifecycle...');
    const ref1 = generateReferenceId('CP');
    const ref2 = generateReferenceId('CP');
    const ref3 = generateReferenceId('CP');
    const ref4 = generateReferenceId('CP');

    // 1. In-Progress task assigned to Devan
    const incidentInProgress = await Incident.create({
      referenceId: ref1,
      title: 'Deep Pothole Hazard near Brigade Road Junction',
      description: 'Dangerous pothole approximately 1.5 meters wide in the middle vehicular lane causing vehicle axle impacts.',
      categoryId: 'potholes_roads',
      category: 'Roads & Potholes',
      priority: 'high',
      status: 'in_progress',
      address: 'Brigade Road Junction, Ashok Nagar, Bengaluru',
      latitude: 12.9738,
      longitude: 77.6075,
      location: { type: 'Point', coordinates: [77.6075, 12.9738] },
      reportedBy: citizenUser._id,
      reporterName: citizenUser.name,
      departmentId: pwrDept._id,
      departmentName: pwrDept.name,
      assignedStaffId: staffUser._id,
      assignedStaffName: staffUser.name,
      dueDate: new Date(Date.now() + 24 * 3600 * 1000),
      timeline: [
        {
          status: 'reported',
          title: 'Problem Reported',
          timestamp: new Date(Date.now() - 48 * 3600 * 1000),
          actorName: citizenUser.name,
          actorRole: 'citizen',
          notes: 'Reported by citizen with location coordinates.',
        },
        {
          status: 'assigned',
          title: 'Work Assigned to Field Staff',
          timestamp: new Date(Date.now() - 24 * 3600 * 1000),
          actorName: managerUser.name,
          actorRole: 'manager',
          notes: 'Dispatched to Devan Field Tech with asphalt compacting orders.',
        },
        {
          status: 'in_progress',
          title: 'Work Commenced: In Progress',
          timestamp: new Date(Date.now() - 4 * 3600 * 1000),
          actorName: staffUser.name,
          actorRole: 'staff',
          notes: 'Cordoned off section and began sub-base excavation.',
        },
      ],
    });

    const assign1 = await Assignment.create({
      referenceId: ref1,
      incidentId: incidentInProgress._id,
      title: incidentInProgress.title,
      incidentTitle: incidentInProgress.title,
      address: incidentInProgress.address,
      latitude: incidentInProgress.latitude,
      longitude: incidentInProgress.longitude,
      staffId: staffUser._id,
      staffName: staffUser.name,
      assignedBy: managerUser._id,
      assignedByName: managerUser.name,
      instructions: 'Excavate loose gravel, apply hot bitumen mix, and level with roller.',
      priority: 'high',
      status: 'in_progress',
      dueDate: new Date(Date.now() + 24 * 3600 * 1000),
    });

    incidentInProgress.currentAssignmentId = assign1._id;
    await incidentInProgress.save();

    // 2. Pending Verification Incident
    const incidentPending = await Incident.create({
      referenceId: ref2,
      title: 'Broken Streetlight Fixture on 100ft Road',
      description: 'Overhead LED luminaire hanging dangerously by exposed cable after high winds.',
      categoryId: 'street_lighting',
      category: 'Street Lighting',
      priority: 'critical',
      status: 'pending_verification',
      address: '100ft Road, Indiranagar, Bengaluru',
      latitude: 12.9784,
      longitude: 77.6408,
      location: { type: 'Point', coordinates: [77.6408, 12.9784] },
      reportedBy: citizenUser._id,
      reporterName: citizenUser.name,
      departmentId: lightDept._id,
      departmentName: lightDept.name,
      assignedStaffId: staffUser._id,
      assignedStaffName: staffUser.name,
      timeline: [
        {
          status: 'reported',
          title: 'Problem Reported',
          timestamp: new Date(Date.now() - 36 * 3600 * 1000),
          actorName: citizenUser.name,
          actorRole: 'citizen',
          notes: 'High priority citizen report.',
        },
        {
          status: 'assigned',
          title: 'Work Assigned to Field Staff',
          timestamp: new Date(Date.now() - 20 * 3600 * 1000),
          actorName: managerUser.name,
          actorRole: 'manager',
          notes: 'Emergency repair dispatched.',
        },
        {
          status: 'pending_verification',
          title: 'Work Completed & Submitted for Verification',
          timestamp: new Date(Date.now() - 2 * 3600 * 1000),
          actorName: staffUser.name,
          actorRole: 'staff',
          notes: 'Replaced cracked bracket, installed new 90W Philips luminaire fixture, tested circuit breaker.',
        },
      ],
    });

    const assign2 = await Assignment.create({
      referenceId: ref2,
      incidentId: incidentPending._id,
      title: incidentPending.title,
      incidentTitle: incidentPending.title,
      address: incidentPending.address,
      latitude: incidentPending.latitude,
      longitude: incidentPending.longitude,
      staffId: staffUser._id,
      staffName: staffUser.name,
      assignedBy: managerUser._id,
      assignedByName: managerUser.name,
      instructions: 'Inspect mounting arm and replace damaged lamp housing.',
      priority: 'critical',
      status: 'pending_verification',
      completionNotes: 'Installed new 90W luminaire, tightened bracket anchor bolts, operational test verified.',
      completionTime: new Date(Date.now() - 2 * 3600 * 1000),
    });

    incidentPending.currentAssignmentId = assign2._id;
    await incidentPending.save();

    // 3. New unassigned report
    await Incident.create({
      referenceId: ref3,
      title: 'Water Main Valve Leak Flooding Pedestrian Sidewalk',
      description: 'Continuous high pressure leak flooding the corner sidewalk and eroding tree planters.',
      categoryId: 'water_supply',
      category: 'Water Supply & Leakage',
      priority: 'medium',
      status: 'reported',
      address: 'Cubbon Park Metro Exit 2, Bengaluru',
      latitude: 12.9798,
      longitude: 77.5908,
      location: { type: 'Point', coordinates: [77.5908, 12.9798] },
      reportedBy: citizenUser._id,
      reporterName: citizenUser.name,
      departmentId: waterDept._id,
      departmentName: waterDept.name,
      timeline: [
        {
          status: 'reported',
          title: 'Problem Reported',
          timestamp: new Date(Date.now() - 6 * 3600 * 1000),
          actorName: citizenUser.name,
          actorRole: 'citizen',
          notes: 'Citizen submitted report with GPS pin.',
        },
      ],
    });

    // 4. Resolved report
    await Incident.create({
      referenceId: ref4,
      title: 'Illegal Commercial Debris Dumped in Public Park',
      description: 'Concrete chunks and tile debris discarded along the walking trail.',
      categoryId: 'sanitation_waste',
      category: 'Sanitation & Waste',
      priority: 'low',
      status: 'resolved',
      address: 'Koramangala 4th Block Park, Bengaluru',
      latitude: 12.9345,
      longitude: 77.6267,
      location: { type: 'Point', coordinates: [77.6267, 12.9345] },
      reportedBy: citizenUser._id,
      reporterName: citizenUser.name,
      resolvedAt: new Date(Date.now() - 12 * 3600 * 1000),
      timeline: [
        {
          status: 'reported',
          title: 'Problem Reported',
          timestamp: new Date(Date.now() - 72 * 3600 * 1000),
          actorName: citizenUser.name,
          actorRole: 'citizen',
          notes: 'Citizen reported debris.',
        },
        {
          status: 'resolved',
          title: 'Resolution Verified & Closed',
          timestamp: new Date(Date.now() - 12 * 3600 * 1000),
          actorName: managerUser.name,
          actorRole: 'manager',
          notes: 'Debris completely carted away to processing facility. Site cleared.',
        },
      ],
    });

    console.log('[Seed] Seeding platform notifications & settings...');
    await Notification.create([
      {
        userId: citizenUser._id,
        title: 'Report Registered',
        message: `Your report #${ref1} has been received by the Public Works Department.`,
        type: 'status_change',
        incidentId: incidentInProgress._id,
        referenceId: ref1,
        isRead: false,
      },
      {
        userId: staffUser._id,
        title: 'New Remediation Task',
        message: `You were assigned Incident #${ref1} on Brigade Road.`,
        type: 'assignment',
        incidentId: incidentInProgress._id,
        referenceId: ref1,
        isRead: false,
      },
    ]);

    await Setting.create({
      key: 'platform_settings',
      slaWarningThresholdHours: 6,
      autoAssignEnabled: false,
      emailNotifications: true,
      publicExplorerEnabled: true,
    });

    await AuditLog.create({
      action: 'PLATFORM_INITIALIZED',
      entityType: 'system',
      targetId: 'civicpulse_system',
      actorName: 'System Seeder',
      actorRole: 'admin',
      details: 'Development baseline data initialized successfully.',
      timestamp: new Date(),
    });

    console.log('========================================================');
    console.log('✅ CivicPulse Development Database Seeded Successfully!');
    console.log('--------------------------------------------------------');
    console.log('Citizen Credentials:  citizen@civicpulse.gov  / Citizen123!');
    console.log('Staff Credentials:    staff@civicpulse.gov    / Staff123!');
    console.log('Manager Credentials:  manager@civicpulse.gov  / Manager123!');
    console.log('Admin Credentials:    admin@civicpulse.gov    / Admin123!');
    console.log('========================================================');

    process.exit(0);
  } catch (err) {
    console.error('[Seed Error] Failed to seed database:', err);
    process.exit(1);
  }
};

seed();
