import bcrypt from 'bcryptjs';
import { connectDB } from '../src/config/db.js';
import { Department } from '../src/models/Department.js';
import { Category } from '../src/models/Category.js';
import { User } from '../src/models/User.js';
import { Setting } from '../src/models/Setting.js';

const initTaxonomy = async () => {
  try {
    console.log('========================================================');
    console.log('🏛️  CivicPulse — Municipal Taxonomy & Demo Initialization');
    console.log('========================================================');

    console.log('[Init] Connecting to MongoDB Atlas...');
    await connectDB();

    // 1. Initialize Departments
    console.log('\n[1/4] Configuring Municipal Departments...');
    const departmentDefinitions = [
      {
        name: 'Public Works & Roads',
        code: 'PWR',
        description: 'Street maintenance, asphalt paving, sidewalks, and civil road structures.',
        serviceArea: 'Metro North & Central Districts',
        contactEmail: 'roads@civicpulse.gov',
      },
      {
        name: 'Electrical & Lighting',
        code: 'EAL',
        description: 'Streetlight grids, traffic illumination, transformer repairs, and wiring.',
        serviceArea: 'City-Wide Municipal Grid',
        contactEmail: 'lighting@civicpulse.gov',
      },
      {
        name: 'Water & Sewage Board',
        code: 'WSB',
        description: 'Potable water distribution, pipeline bursts, sewer lines, and storm drains.',
        serviceArea: 'Greater Municipal Zone',
        contactEmail: 'water@civicpulse.gov',
      },
      {
        name: 'Solid Waste Management',
        code: 'SWM',
        description: 'Garbage collection, community dumpster clearance, and municipal sanitation.',
        serviceArea: 'All City Wards (1-12)',
        contactEmail: 'sanitation@civicpulse.gov',
      },
      {
        name: 'Parks & Public Spaces',
        code: 'PPS',
        description: 'Public park maintenance, fallen trees, playground safety, and landscaping.',
        serviceArea: 'Urban Parks & Green Corridors',
        contactEmail: 'parks@civicpulse.gov',
      },
    ];

    const departmentMap = {};
    for (const def of departmentDefinitions) {
      let dept = await Department.findOne({ name: def.name });
      if (!dept) {
        dept = await Department.create(def);
        console.log(`  + Created department: "${dept.name}" (${dept.code})`);
      } else {
        console.log(`  ✓ Department exists:  "${dept.name}" (${dept.code})`);
      }
      departmentMap[def.name] = dept;
    }

    // 2. Initialize Categories & Statutory SLAs
    console.log('\n[2/4] Configuring Issue Categories & Target SLAs...');
    const categoryDefinitions = [
      {
        key: 'potholes_roads',
        name: 'Roads & Potholes',
        description: 'Damaged pavement, hazardous potholes, crater depressions, and road cracks.',
        department: 'Public Works & Roads',
        slaHours: 48,
        icon: 'AlertTriangle',
      },
      {
        key: 'street_lighting',
        name: 'Street Lighting & Grids',
        description: 'Dark corridors, non-functional streetlights, exposed wires, or damaged fixtures.',
        department: 'Electrical & Lighting',
        slaHours: 24,
        icon: 'Lightbulb',
      },
      {
        key: 'water_supply',
        name: 'Water Supply & Leakage',
        description: 'Main pipeline bursts, municipal water leakage, low pressure, or contaminated supply.',
        department: 'Water & Sewage Board',
        slaHours: 12,
        icon: 'Droplets',
      },
      {
        key: 'sanitation_waste',
        name: 'Sanitation & Garbage Waste',
        description: 'Overflowing dumpsters, illegal trash dumping, debris accumulation, or unsanitary litter.',
        department: 'Solid Waste Management',
        slaHours: 18,
        icon: 'Trash2',
      },
      {
        key: 'drainage_flood',
        name: 'Drainage & Sewer Blockage',
        description: 'Clogged storm drains, sewage overflows, street waterlogging, or missing manholes.',
        department: 'Water & Sewage Board',
        slaHours: 16,
        icon: 'Waves',
      },
      {
        key: 'parks_hazards',
        name: 'Fallen Trees & Park Hazards',
        description: 'Uprooted branches, pathway obstructions, broken park equipment, or fence hazards.',
        department: 'Parks & Public Spaces',
        slaHours: 24,
        icon: 'Trees',
      },
    ];

    for (const def of categoryDefinitions) {
      const existing = await Category.findOne({ key: def.key });
      if (!existing) {
        const cat = await Category.create(def);
        console.log(`  + Created category: "${cat.name}" (SLA: ${cat.slaHours}h, Dept: ${cat.department})`);
      } else {
        console.log(`  ✓ Category exists:  "${existing.name}" (SLA: ${existing.slaHours}h)`);
      }
    }

    // 3. Initialize Platform Settings
    console.log('\n[3/4] Checking Platform Operational Settings...');
    let settings = await Setting.findOne({ key: 'platform_settings' });
    if (!settings) {
      settings = await Setting.create({
        key: 'platform_settings',
        slaWarningThresholdHours: 6,
        autoAssignEnabled: false,
        emailNotifications: true,
        publicExplorerEnabled: true,
      });
      console.log('  + Created baseline platform settings.');
    } else {
      console.log('  ✓ Platform settings verified.');
    }

    // 4. Initialize Core Role Users (Citizen, Staff, Manager)
    console.log('\n[4/4] Ensuring Core Role User Accounts...');
    const pwrDept = departmentMap['Public Works & Roads'];

    const userTemplates = [
      {
        email: 'citizen@civicpulse.gov',
        name: 'Citizen Jane',
        password: 'Citizen123!',
        role: 'citizen',
        phone: '+1 (555) 234-5678',
        address: '742 Evergreen Terrace, Ward 4',
        ward: 'Ward 4',
      },
      {
        email: 'staff@civicpulse.gov',
        name: 'Marcus Vance',
        password: 'Staff123!',
        role: 'staff',
        phone: '+1 (555) 345-6789',
        employeeId: 'PWR-TECH-101',
        departmentId: pwrDept._id,
        departmentName: pwrDept.name,
      },
      {
        email: 'manager@civicpulse.gov',
        name: 'Sarah Jenkins',
        password: 'Manager123!',
        role: 'manager',
        phone: '+1 (555) 456-7890',
        employeeId: 'PWR-MGR-001',
        departmentId: pwrDept._id,
        departmentName: pwrDept.name,
      },
    ];

    for (const tpl of userTemplates) {
      const existing = await User.findOne({ email: tpl.email });
      if (!existing) {
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(tpl.password, salt);
        const newUser = await User.create({
          name: tpl.name,
          email: tpl.email,
          passwordHash,
          role: tpl.role,
          phone: tpl.phone || '',
          address: tpl.address || '',
          ward: tpl.ward || '',
          employeeId: tpl.employeeId || '',
          departmentId: tpl.departmentId || null,
          departmentName: tpl.departmentName || '',
          isActive: true,
        });
        console.log(`  + Provisioned ${tpl.role.toUpperCase()} user: ${newUser.email} (Password: ${tpl.password})`);
      } else {
        console.log(`  ✓ ${tpl.role.toUpperCase()} user exists: ${existing.email}`);
      }
    }

    // Check existing admins
    const admins = await User.find({ role: 'admin' });
    console.log('\n🛡️  Active Administrators Preserved:');
    admins.forEach((admin) => {
      console.log(`  • ${admin.name} <${admin.email}>`);
    });

    console.log('\n========================================================');
    console.log('✅ Base municipal taxonomy and role accounts initialized!');
    console.log('========================================================');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ [Init Error]:', error.message);
    process.exit(1);
  }
};

initTaxonomy();
