const prisma = require('../config/prisma');
const { seedDatabase } = require('../../prisma/seed');

/**
 * Bootstrap Database & verify initial administrative user exists.
 * Runs idempotently on server startup to guarantee the initial Admin account is ready.
 */
async function bootstrapDatabase() {
  // Skip during unit tests
  if (process.env.NODE_ENV === 'test') {
    return;
  }

  try {
    // Check if we are running with live PrismaClient or in-memory mock
    if (prisma && prisma.user && typeof prisma.user.findFirst === 'function') {
      const adminUser = await prisma.user.findFirst({
        where: { role: 'ADMIN' }
      });

      if (!adminUser) {
        console.log('🌱 No Admin account found in database. Initializing default accounts and settings...');
        await seedDatabase(prisma);
        console.log('✅ Database bootstrap: Admin, Treasurer, and Default Settings initialized successfully.');
      } else {
        // Database already seeded
        console.log(`✅ Database ready. Admin account found (@${adminUser.username}).`);
      }
    }
  } catch (error) {
    if (error.code === 'P2021') {
      console.warn('⚠️  Database tables not detected yet (P2021). Schema push required: run "npx prisma db push".');
    } else {
      console.warn('⚠️  Database bootstrap note:', error.message || error);
    }
  }
}

module.exports = {
  bootstrapDatabase
};
