const prisma = require('../config/prisma');
const { logAudit } = require('../middleware/audit');

/**
 * List Donors with Search and Pagination
 */
async function listDonors(req, res) {
  try {
    const { page = 1, limit = 10, search = '', sortBy = 'totalContribution', order = 'desc' } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where = {};
    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { mobile: { contains: q } },
        { address: { contains: q, mode: 'insensitive' } }
      ];
    }

    const orderBy = {};
    if (['totalContribution', 'donationCount', 'name', 'lastDonationDate', 'createdAt'].includes(sortBy)) {
      orderBy[sortBy] = order === 'asc' ? 'asc' : 'desc';
    } else {
      orderBy.totalContribution = 'desc';
    }

    const [donors, total] = await Promise.all([
      prisma.donor.findMany({
        where,
        skip,
        take,
        orderBy
      }),
      prisma.donor.count({ where })
    ]);

    const totalContributionAgg = await prisma.donor.aggregate({
      where,
      _sum: { totalContribution: true }
    });

    res.json({
      success: true,
      data: donors,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take) || 1
      },
      filteredTotalContribution: totalContributionAgg._sum.totalContribution || 0
    });
  } catch (error) {
    console.error('listDonors error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch donors list.' });
  }
}

/**
 * Fast Auto-suggest search for Donor form autocomplete (Search by mobile or name)
 */
async function searchDonorSuggestions(req, res) {
  try {
    const { query = '' } = req.query;
    if (!query.trim() || query.trim().length < 2) {
      return res.json({ success: true, data: [] });
    }

    const q = query.trim();
    const suggestions = await prisma.donor.findMany({
      where: {
        OR: [
          { mobile: { contains: q } },
          { name: { contains: q, mode: 'insensitive' } }
        ]
      },
      take: 8,
      orderBy: { totalContribution: 'desc' },
      select: {
        id: true,
        name: true,
        mobile: true,
        address: true,
        totalContribution: true,
        donationCount: true,
        lastDonationDate: true
      }
    });

    res.json({ success: true, data: suggestions });
  } catch (error) {
    console.error('searchDonorSuggestions error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch suggestions.' });
  }
}

/**
 * Get Donor Profile with Full History
 */
async function getDonorById(req, res) {
  try {
    const { id } = req.params;

    const donor = await prisma.donor.findUnique({
      where: { id },
      include: {
        collections: {
          orderBy: { collectionDate: 'desc' },
          include: {
            collector: { select: { id: true, name: true } }
          }
        }
      }
    });

    if (!donor) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }

    res.json({ success: true, data: donor });
  } catch (error) {
    console.error('getDonorById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch donor details.' });
  }
}

/**
 * Create Donor manually
 */
async function createDonor(req, res) {
  try {
    const { name, mobile, address, notes } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Donor name is required.' });
    }

    if (!mobile || !/^\d{10}$/.test(mobile.trim())) {
      return res.status(400).json({ success: false, message: 'Valid 10-digit mobile is required.' });
    }

    const existing = await prisma.donor.findUnique({
      where: { mobile: mobile.trim() }
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'A donor with this mobile number already exists.',
        donorId: existing.id
      });
    }

    const donor = await prisma.donor.create({
      data: {
        name: name.trim(),
        mobile: mobile.trim(),
        address: address ? address.trim() : null,
        notes: notes ? notes.trim() : null
      }
    });

    await logAudit({
      req,
      action: 'CREATE_DONOR',
      entity: 'Donor',
      entityId: donor.id,
      description: `Donor ${donor.name} (${donor.mobile}) registered by ${req.user.name}.`
    });

    res.status(201).json({ success: true, message: 'Donor created successfully.', data: donor });
  } catch (error) {
    console.error('createDonor error:', error);
    res.status(500).json({ success: false, message: 'Failed to create donor.' });
  }
}

/**
 * Update Donor
 */
async function updateDonor(req, res) {
  try {
    const { id } = req.params;
    const { name, mobile, address, notes } = req.body;

    const existing = await prisma.donor.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Donor not found.' });
    }

    if (mobile && mobile.trim() !== existing.mobile) {
      const mobileCheck = await prisma.donor.findUnique({ where: { mobile: mobile.trim() } });
      if (mobileCheck) {
        return res.status(400).json({ success: false, message: 'Another donor with this mobile already exists.' });
      }
    }

    const updated = await prisma.donor.update({
      where: { id },
      data: {
        name: name ? name.trim() : existing.name,
        mobile: mobile ? mobile.trim() : existing.mobile,
        address: address !== undefined ? address.trim() : existing.address,
        notes: notes !== undefined ? notes.trim() : existing.notes
      }
    });

    await logAudit({
      req,
      action: 'UPDATE_DONOR',
      entity: 'Donor',
      entityId: id,
      description: `Donor ${updated.name} updated by ${req.user.name}.`
    });

    res.json({ success: true, message: 'Donor updated successfully.', data: updated });
  } catch (error) {
    console.error('updateDonor error:', error);
    res.status(500).json({ success: false, message: 'Failed to update donor.' });
  }
}

module.exports = {
  listDonors,
  searchDonorSuggestions,
  getDonorById,
  createDonor,
  updateDonor
};
