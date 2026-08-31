const prisma = require('../config/prisma');
const { logAudit } = require('../middleware/audit');

/**
 * List all Collectors with optional active filter and statistics
 * GET /api/collectors
 */
async function listCollectors(req, res) {
  try {
    const { activeOnly, search, includeStats } = req.query;

    const where = {};
    if (activeOnly === 'true') {
      where.isActive = true;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { mobile: { contains: q } }
      ];
    }

    const collectors = await prisma.collector.findMany({
      where,
      orderBy: { name: 'asc' }
    });

    if (includeStats !== 'true') {
      return res.json({
        success: true,
        data: collectors
      });
    }

    // Compute stats for each collector (Only ACTIVE collections)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const collectorsWithStats = await Promise.all(
      collectors.map(async (c) => {
        const activeCollections = await prisma.collection.findMany({
          where: {
            collectorId: c.id,
            status: 'ACTIVE'
          },
          orderBy: { collectionDate: 'desc' }
        });

        let totalCollection = 0;
        let todayCollection = 0;
        let thisMonthCollection = 0;

        activeCollections.forEach((col) => {
          const amt = col.amount || 0;
          totalCollection += amt;

          const colDate = new Date(col.collectionDate);
          if (colDate >= today) {
            todayCollection += amt;
          }
          if (colDate >= firstDayOfMonth) {
            thisMonthCollection += amt;
          }
        });

        return {
          ...c,
          totalCollection,
          totalCount: activeCollections.length,
          todayCollection,
          thisMonthCollection,
          lastCollectionDate: activeCollections.length > 0 ? activeCollections[0].collectionDate : null
        };
      })
    );

    // Sort by totalCollection descending when stats are requested
    collectorsWithStats.sort((a, b) => b.totalCollection - a.totalCollection);

    res.json({
      success: true,
      data: collectorsWithStats
    });
  } catch (err) {
    console.error('Error listing collectors:', err);
    res.status(500).json({
      success: false,
      message: 'प्रतिनिधी यादी लोड करण्यात त्रुटी आली.'
    });
  }
}

/**
 * Create a new Collector (No login required)
 * POST /api/collectors
 */
async function createCollector(req, res) {
  try {
    const { name, mobile } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'प्रतिनिधीचे नाव आवश्यक आहे (Collector name is required).'
      });
    }

    const cleanName = name.trim();
    const cleanMobile = mobile ? mobile.trim() : null;

    // Check if collector with same name already exists
    const existing = await prisma.collector.findFirst({
      where: { name: { contains: cleanName, mode: 'insensitive' } }
    });

    if (existing && existing.name.toLowerCase() === cleanName.toLowerCase()) {
      // If inactive, we can reactivate or warn
      if (!existing.isActive) {
        const reactivated = await prisma.collector.update({
          where: { id: existing.id },
          data: { isActive: true, mobile: cleanMobile || existing.mobile }
        });
        return res.json({
          success: true,
          message: `प्रतिनिधी पुन्हा सक्रिय केले: ${reactivated.name}`,
          data: reactivated
        });
      }
      return res.status(400).json({
        success: false,
        message: `'${cleanName}' या नावाचा प्रतिनिधी आधीच अस्तित्वात आहे.`
      });
    }

    const newCollector = await prisma.collector.create({
      data: {
        name: cleanName,
        mobile: cleanMobile,
        isActive: true
      }
    });

    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'CREATE_COLLECTOR',
      entity: 'Collector',
      entityId: newCollector.id,
      description: `New collector added: ${newCollector.name} (${newCollector.mobile || 'No Mobile'})`,
      req
    });

    res.status(201).json({
      success: true,
      message: `नवीन प्रतिनिधी यशस्वीपणे जोडले: ${newCollector.name}`,
      data: newCollector
    });
  } catch (err) {
    console.error('Error creating collector:', err);
    res.status(500).json({
      success: false,
      message: 'नवीन प्रतिनिधी जतन करण्यात त्रुटी आली.'
    });
  }
}

/**
 * Update an existing Collector's name or mobile
 * PUT /api/collectors/:id
 */
async function updateCollector(req, res) {
  try {
    const { id } = req.params;
    const { name, mobile, isActive } = req.body;

    const existing = await prisma.collector.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'प्रतिनिधी सापडला नाही.'
      });
    }

    const updateData = {};
    if (name && name.trim()) updateData.name = name.trim();
    if (mobile !== undefined) updateData.mobile = mobile ? mobile.trim() : null;
    if (isActive !== undefined) updateData.isActive = Boolean(isActive);

    const updated = await prisma.collector.update({
      where: { id },
      data: updateData
    });

    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'UPDATE_COLLECTOR',
      entity: 'Collector',
      entityId: updated.id,
      description: `Collector updated: ${updated.name}`,
      req
    });

    res.json({
      success: true,
      message: `प्रतिनिधी माहिती अद्ययावत झाली: ${updated.name}`,
      data: updated
    });
  } catch (err) {
    console.error('Error updating collector:', err);
    res.status(500).json({
      success: false,
      message: 'प्रतिनिधी माहिती अद्ययावत करण्यात त्रुटी आली.'
    });
  }
}

/**
 * Toggle Collector Active Status
 * PATCH /api/collectors/:id/status
 */
async function toggleStatus(req, res) {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const existing = await prisma.collector.findUnique({
      where: { id }
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'प्रतिनिधी सापडला नाही.'
      });
    }

    const newStatus = isActive !== undefined ? Boolean(isActive) : !existing.isActive;

    const updated = await prisma.collector.update({
      where: { id },
      data: { isActive: newStatus }
    });

    await logAudit({
      userId: req.user.id,
      userName: req.user.name,
      role: req.user.role,
      action: 'TOGGLE_COLLECTOR_STATUS',
      entity: 'Collector',
      entityId: updated.id,
      description: `Collector ${updated.name} status changed to ${newStatus ? 'ACTIVE' : 'INACTIVE'}`,
      req
    });

    res.json({
      success: true,
      message: `प्रतिनिधी स्थिती बदलली: ${updated.name} (${newStatus ? 'सक्रिय / Active' : 'निष्क्रिय / Inactive'})`,
      data: updated
    });
  } catch (err) {
    console.error('Error toggling collector status:', err);
    res.status(500).json({
      success: false,
      message: 'प्रतिनिधी स्थिती बदलण्यात त्रुटी आली.'
    });
  }
}

/**
 * Get Specific Collector Detailed Statistics
 * GET /api/collectors/:id/statistics
 */
async function getCollectorStatistics(req, res) {
  try {
    const { id } = req.params;

    const collector = await prisma.collector.findUnique({
      where: { id }
    });

    if (!collector) {
      return res.status(404).json({
        success: false,
        message: 'प्रतिनिधी सापडला नाही.'
      });
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    const activeCollections = await prisma.collection.findMany({
      where: {
        collectorId: id,
        status: 'ACTIVE'
      },
      orderBy: { collectionDate: 'desc' }
    });

    let totalCollection = 0;
    let todayCollection = 0;
    let thisMonthCollection = 0;

    activeCollections.forEach((col) => {
      const amt = col.amount || 0;
      totalCollection += amt;

      const colDate = new Date(col.collectionDate);
      if (colDate >= today) {
        todayCollection += amt;
      }
      if (colDate >= firstDayOfMonth) {
        thisMonthCollection += amt;
      }
    });

    res.json({
      success: true,
      data: {
        collector,
        totalCollection,
        totalCount: activeCollections.length,
        todayCollection,
        thisMonthCollection,
        lastCollectionDate: activeCollections.length > 0 ? activeCollections[0].collectionDate : null,
        recentCollections: activeCollections.slice(0, 10)
      }
    });
  } catch (err) {
    console.error('Error getting collector statistics:', err);
    res.status(500).json({
      success: false,
      message: 'प्रतिनिधी आकडेवारी लोड करण्यात त्रुटी आली.'
    });
  }
}

module.exports = {
  listCollectors,
  createCollector,
  updateCollector,
  toggleStatus,
  getCollectorStatistics
};
