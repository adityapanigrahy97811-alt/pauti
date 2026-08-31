const prisma = require('../config/prisma');

/**
 * List Audit Logs with Filtering & Pagination (Admin only)
 */
async function listAuditLogs(req, res) {
  try {
    const { page = 1, limit = 20, action, entity, search = '' } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where = {};
    if (action && action !== 'ALL') where.action = action;
    if (entity && entity !== 'ALL') where.entity = entity;

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { userName: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { action: { contains: q, mode: 'insensitive' } },
        { ipAddress: { contains: q } }
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, username: true, role: true } }
        }
      }),
      prisma.auditLog.count({ where })
    ]);

    res.json({
      success: true,
      data: logs,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take) || 1
      }
    });
  } catch (error) {
    console.error('listAuditLogs error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch audit logs.' });
  }
}

module.exports = {
  listAuditLogs
};
