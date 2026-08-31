const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
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
  console.log('✅ Settings initialized');

  // 2. Create Users
  const salt = await bcrypt.genSalt(10);
  const adminPasswordHash = await bcrypt.hash('Admin@123', salt);
  const treasurerPasswordHash = await bcrypt.hash('Treasurer@123', salt);
  const collectorPasswordHash = await bcrypt.hash('Collector@123', salt);

  const adminUser = await prisma.user.upsert({
    where: { username: 'admin' },
    update: { password: adminPasswordHash },
    create: {
      name: 'Aditya Patil (Admin)',
      username: 'admin',
      email: 'admin@ashtavinayak-boisar.org',
      mobile: '9822001122',
      password: adminPasswordHash,
      role: 'ADMIN',
      status: 'ACTIVE',
      mustChangePassword: false
    }
  });

  const treasurerUser = await prisma.user.upsert({
    where: { username: 'treasurer' },
    update: { password: treasurerPasswordHash },
    create: {
      name: 'Santosh Sawant (Treasurer)',
      username: 'treasurer',
      email: 'treasurer@ashtavinayak-boisar.org',
      mobile: '9833445566',
      password: treasurerPasswordHash,
      role: 'TREASURER',
      status: 'ACTIVE'
    }
  });

  const collectorUser = await prisma.user.upsert({
    where: { username: 'collector1' },
    update: { password: collectorPasswordHash },
    create: {
      name: 'Sachin Jadhav (Collector)',
      username: 'collector1',
      email: 'collector1@ashtavinayak-boisar.org',
      mobile: '9877889900',
      password: collectorPasswordHash,
      role: 'COLLECTOR',
      status: 'ACTIVE'
    }
  });
  console.log('✅ Default users created (admin, treasurer, collector1)');

  // 3. Initialize Counters
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
  console.log('✅ Counters initialized to 0');

  // 4. Initial Audit Log
  await prisma.auditLog.create({
    action: 'INITIALIZE_SYSTEM',
    entity: 'System',
    entityId: 'default',
    description: 'Ashtavinayak Mitra Mandal System initialized for 39th Ganeshotsav 2026.',
    userId: adminUser.id,
    userName: adminUser.name,
    role: adminUser.role,
    ipAddress: '127.0.0.1',
    details: JSON.stringify({ version: '1.0.0', year: 2026, mandal: 'अष्टविनायक मित्र मंडळ' })
  });
  console.log('✅ Audit log created');

  console.log('🎉 Production Seed process completed successfully! System is clean and ready for real entries.');
}

main()
  .catch((e) => {
    console.error('❌ Error in database seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
