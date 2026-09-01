require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

let prismaClientInstance;
function getPrismaClient() {
  if (!prismaClientInstance) {
    prismaClientInstance = new PrismaClient();
  }
  return prismaClientInstance;
}

/**
 * Seed database with initial Settings, Users, Collectors, and Counters.
 * Fully idempotent: safe to execute multiple times against fresh or existing databases.
 *
 * @param {PrismaClient} [client] - Optional PrismaClient instance
 */
async function seedDatabase(client) {
  const prisma = client || getPrismaClient();

  console.log('🌱 Starting database seed for Ashtavinayak Mitra Mandal...');

  // 1. Initialize Settings
  const settings = await prisma.settings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      mandalName: 'अष्टविनायक मित्र मंडळ',
      mandalNameEn: 'Ashtavinayak Mitra Mandal',
      establishedYear: 1987,
      festivalYear: '३९ वा गणेशोत्सव',
      location: 'रोहित कॉलनी, बोईसर',
      locationEn: 'Rohit Colony, Boisar',
      brandingText: '|| गणपती बाप्पा मोरया ||',
      receiptPrefix: 'MNDL',
      receiptStartingNo: 1,
      receiptFooterMarathi: 'आपल्या सहकार्याबद्दल मनःपूर्वक धन्यवाद.',
      receiptFooterEnglish: 'Thank you for your generous contribution.',
      currency: 'INR',
      timezone: 'Asia/Kolkata',
      dateFormat: 'DD/MM/YYYY',
      authorizedSignatoryTitle: 'कार्याध्यक्ष / खजिनदार'
    }
  });
  console.log('✅ Mandal settings ready');

  // 2. Prepare Credentials from Environment Variables or project defaults
  const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
  const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'Admin@123';
  const ADMIN_NAME = process.env.ADMIN_NAME || 'Aditya Patil (Admin)';
  const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@ashtavinayak-boisar.org';
  const ADMIN_MOBILE = process.env.ADMIN_MOBILE || '9822001122';

  const TREASURER_USERNAME = process.env.TREASURER_USERNAME || 'treasurer';
  const TREASURER_PASSWORD = process.env.TREASURER_PASSWORD || 'Treasurer@123';
  const TREASURER_NAME = process.env.TREASURER_NAME || 'Santosh Sawant (Treasurer)';
  const TREASURER_EMAIL = process.env.TREASURER_EMAIL || 'treasurer@ashtavinayak-boisar.org';
  const TREASURER_MOBILE = process.env.TREASURER_MOBILE || '9833445566';

  const COLLECTOR_USERNAME = process.env.COLLECTOR_USERNAME || 'collector1';
  const COLLECTOR_PASSWORD = process.env.COLLECTOR_PASSWORD || 'Collector@123';
  const COLLECTOR_NAME = process.env.COLLECTOR_NAME || 'Sachin Jadhav (Collector)';
  const COLLECTOR_EMAIL = process.env.COLLECTOR_EMAIL || 'collector1@ashtavinayak-boisar.org';
  const COLLECTOR_MOBILE = process.env.COLLECTOR_MOBILE || '9877889900';

  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash(ADMIN_PASSWORD, salt);
  const treasurerPasswordHash = await bcrypt.hash(TREASURER_PASSWORD, salt);
  const collectorPasswordHash = await bcrypt.hash(COLLECTOR_PASSWORD, salt);

  // 3. Upsert Users (Idempotent - preserves existing data, ensures ACTIVE status)
  const adminUser = await prisma.user.upsert({
    where: { username: ADMIN_USERNAME },
    update: {
      status: 'ACTIVE',
      role: 'ADMIN'
    },
    create: {
      name: ADMIN_NAME,
      username: ADMIN_USERNAME,
      email: ADMIN_EMAIL,
      mobile: ADMIN_MOBILE,
      password: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      mustChangePassword: false
    }
  });

  const treasurerUser = await prisma.user.upsert({
    where: { username: TREASURER_USERNAME },
    update: {
      status: 'ACTIVE',
      role: 'TREASURER'
    },
    create: {
      name: TREASURER_NAME,
      username: TREASURER_USERNAME,
      email: TREASURER_EMAIL,
      mobile: TREASURER_MOBILE,
      password: treasurerPasswordHash,
      role: 'TREASURER',
      status: 'ACTIVE',
      mustChangePassword: false
    }
  });

  const collectorUser = await prisma.user.upsert({
    where: { username: COLLECTOR_USERNAME },
    update: {
      status: 'ACTIVE',
      role: 'COLLECTOR'
    },
    create: {
      name: COLLECTOR_NAME,
      username: COLLECTOR_USERNAME,
      email: COLLECTOR_EMAIL,
      mobile: COLLECTOR_MOBILE,
      password: collectorPasswordHash,
      role: 'COLLECTOR',
      status: 'ACTIVE',
      mustChangePassword: false
    }
  });
  console.log(`✅ Default users ready: @${adminUser.username} (ADMIN), @${treasurerUser.username} (TREASURER), @${collectorUser.username} (COLLECTOR)`);

  // 4. Upsert Dedicated Collector directory records
  if (prisma.collector && typeof prisma.collector.findFirst === 'function') {
    const defaultCollectors = [
      { name: 'Sachin Jadhav', mobile: '9877889900' },
      { name: 'Amit Patil', mobile: '9822112233' },
      { name: 'Rahul More', mobile: '9890123456' }
    ];

    for (const col of defaultCollectors) {
      const existingCol = await prisma.collector.findFirst({
        where: { name: col.name }
      });
      if (!existingCol) {
        await prisma.collector.create({
          data: {
            name: col.name,
            mobile: col.mobile,
            isActive: true
          }
        });
      }
    }
    console.log('✅ Default collection representatives ready');
  }

  // 5. Initialize Sequence Counters
  if (prisma.counter && typeof prisma.counter.upsert === 'function') {
    await prisma.counter.upsert({
      where: { id: 'receipt_2026' },
      update: {},
      create: { id: 'receipt_2026', seq: 0 }
    });

    await prisma.counter.upsert({
      where: { id: 'expense_2026' },
      update: {},
      create: { id: 'expense_2026', seq: 0 }
    });
    console.log('✅ Sequence counters initialized');
  }

  // 6. Initial Audit Log
  if (prisma.auditLog && typeof prisma.auditLog.findFirst === 'function') {
    const existingAudit = await prisma.auditLog.findFirst({
      where: { action: 'INITIALIZE_SYSTEM' }
    });

    if (!existingAudit) {
      await prisma.auditLog.create({
        data: {
          action: 'INITIALIZE_SYSTEM',
          entity: 'System',
          entityId: 'default',
          description: 'Ashtavinayak Mitra Mandal System initialized for 39th Ganeshotsav 2026.',
          userId: adminUser.id,
          userName: adminUser.name,
          role: adminUser.role,
          ipAddress: '127.0.0.1',
          details: JSON.stringify({ version: '1.0.0', year: 2026, mandal: 'अष्टविनायक मित्र मंडळ' })
        }
      });
      console.log('✅ System initialization audit log recorded');
    }
  }

  console.log('🎉 Seed process completed successfully! System is clean and ready.');
  return { adminUser, treasurerUser, collectorUser, settings };
}

// Run directly when called via `node prisma/seed.js` or `npm run seed`
if (require.main === module) {
  const client = getPrismaClient();
  seedDatabase(client)
    .catch((e) => {
      console.error('❌ Error during database seed:', e);
      process.exit(1);
    })
    .finally(async () => {
      if (prismaClientInstance) {
        await prismaClientInstance.$disconnect();
      }
    });
}

module.exports = {
  seedDatabase
};
