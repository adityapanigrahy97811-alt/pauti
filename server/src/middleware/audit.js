const prisma = require('../config/prisma');

/**
 * Log audit events safely in background
 */
async function logAudit({ req, action, entity, entityId, description, details }) {
  try {
    const ipAddress = req?.headers ? (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '127.0.0.1') : '127.0.0.1';
    const user = req?.user;

    await prisma.auditLog.create({
      data: {
        userId: user?.id || null,
        userName: user?.name || 'System / Anonymous',
        role: user?.role || null,
        action,
        entity,
        entityId: entityId ? String(entityId) : null,
        description,
        ipAddress: typeof ipAddress === 'string' ? ipAddress.split(',')[0].trim() : '127.0.0.1',
        details: details ? (typeof details === 'string' ? details : JSON.stringify(details)) : null
      }
    });
  } catch (error) {
    console.error('⚠️ Failed to write audit log:', error.message);
  }
}

module.exports = {
  logAudit
};
