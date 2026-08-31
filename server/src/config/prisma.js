const { PrismaClient } = require('@prisma/client');
const { mockPrisma } = require('./dbAdapter');

let prismaInstance;

// In local development or testing without live PostgreSQL daemon, use the adapter
if (process.env.NODE_ENV === 'test' || !process.env.DATABASE_URL || process.env.DATABASE_URL.includes('localhost:5432')) {
  // Use mock adapter for instant local execution
  prismaInstance = mockPrisma;
  console.log('⚡ Running with In-Memory Store & seeded data for Ashtavinayak Mitra Mandal');
} else {
  // Production / Cloud PostgreSQL with DATABASE_URL
  prismaInstance = new PrismaClient({
    log: ['warn', 'error']
  });
}

module.exports = prismaInstance;
