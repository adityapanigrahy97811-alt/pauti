const prisma = require('../config/prisma');
const { generateReceiptNumber } = require('../utils/helpers');
const { numberToWordsEnglish, numberToWordsMarathi } = require('../utils/numberToWords');
const { logAudit } = require('../middleware/audit');

/**
 * List Collections with Search, Filtering and Pagination
 */
async function listCollections(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      startDate,
      endDate,
      paymentMode,
      collectorId,
      createdById,
      purpose,
      status = 'ALL'
    } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where = {};

    // Collector filter
    if (req.user.role === 'COLLECTOR' && req.query.myOnly === 'true') {
      where.collectorId = req.user.id;
    } else if (collectorId && collectorId !== 'ALL') {
      where.collectorId = collectorId;
    }

    // Created By Operator filter
    if (createdById && createdById !== 'ALL') {
      where.createdById = createdById;
    }

    // Status filter
    if (status && status !== 'ALL') {
      where.status = status;
    }

    // Payment Mode
    if (paymentMode && paymentMode !== 'ALL') {
      where.paymentMode = paymentMode;
    }

    // Purpose
    if (purpose && purpose !== 'ALL') {
      where.purpose = purpose;
    }

    // Date Range
    if (startDate || endDate) {
      where.collectionDate = {};
      if (startDate) {
        where.collectionDate.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.collectionDate.lte = end;
      }
    }

    // Search query (Donor Name, Mobile, Receipt No)
    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { donorName: { contains: q, mode: 'insensitive' } },
        { mobile: { contains: q } },
        { receiptNo: { contains: q, mode: 'insensitive' } }
      ];
    }

    const [collections, total] = await Promise.all([
      prisma.collection.findMany({
        where,
        skip,
        take,
        orderBy: { collectionDate: 'desc' },
        include: {
          collector: { select: { id: true, name: true, username: true } },
          createdBy: { select: { id: true, name: true } },
          donor: { select: { id: true, name: true, totalContribution: true } }
        }
      }),
      prisma.collection.count({ where })
    ]);

    // Active Total for the filtered subset
    const activeTotalAggregate = await prisma.collection.aggregate({
      where: { ...where, status: 'ACTIVE' },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: collections,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take) || 1
      },
      filteredActiveTotal: activeTotalAggregate._sum.amount || 0
    });
  } catch (error) {
    console.error('listCollections error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch collections.' });
  }
}

/**
 * Create a New Cash / UPI / Bank Collection
 */
async function createCollection(req, res) {
  try {
    const {
      donorName,
      mobile,
      address,
      amount,
      paymentMode = 'CASH',
      purpose = 'Ganeshotsav Donation',
      collectionDate,
      collectorId
    } = req.body;

    // Validations
    if (!donorName || !donorName.trim()) {
      return res.status(400).json({ success: false, message: 'Donor name is required. देणगीदाराचे नाव आवश्यक आहे.' });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({ success: false, message: 'Amount must be greater than 0. रक्कम शून्य पेक्षा जास्त असावी.' });
    }

    // Get settings for prefix
    const settings = await prisma.settings.findUnique({ where: { id: 'default' } });
    const prefix = settings?.receiptPrefix || 'MNDL';
    const year = 2026;

    // Generate safe sequential receipt number
    const receiptNo = await generateReceiptNumber(year, prefix);

    // Resolve Collector from dedicated Collector entity
    let assignedCollectorId = null;
    let resolvedCollectorName = '';

    if (collectorId) {
      const coltr = await prisma.collector.findUnique({
        where: { id: collectorId }
      });
      if (coltr) {
        if (!coltr.isActive) {
          return res.status(400).json({
            success: false,
            message: `निवडलेले प्रतिनिधी (${coltr.name}) सध्या निष्क्रिय आहेत. कृपया सक्रिय प्रतिनिधी निवडा.`
          });
        }
        assignedCollectorId = coltr.id;
        resolvedCollectorName = coltr.name;
      }
    }

    // If collectorId not matched or not provided, fallback to first active collector
    if (!assignedCollectorId) {
      const firstActive = await prisma.collector.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' }
      });
      if (firstActive) {
        assignedCollectorId = firstActive.id;
        resolvedCollectorName = firstActive.name;
      } else {
        resolvedCollectorName = req.user.name;
      }
    }

    // Upsert Donor & update contribution stats atomically
    const cleanMobile = mobile ? mobile.trim() : '';
    const cleanName = donorName.trim();
    const cleanAddress = address ? address.trim() : '';

    let donor = null;
    if (cleanMobile) {
      donor = await prisma.donor.findUnique({ where: { mobile: cleanMobile } });
    } else {
      donor = await prisma.donor.findFirst({ where: { name: cleanName } });
    }

    if (donor) {
      donor = await prisma.donor.update({
        where: { id: donor.id },
        data: {
          name: cleanName,
          address: cleanAddress || donor.address,
          totalContribution: { increment: numAmount },
          donationCount: { increment: 1 },
          lastDonationDate: collectionDate ? new Date(collectionDate) : new Date()
        }
      });
    } else {
      donor = await prisma.donor.create({
        data: {
          name: cleanName,
          mobile: cleanMobile || `NA_${Date.now()}`,
          address: cleanAddress,
          totalContribution: numAmount,
          donationCount: 1,
          lastDonationDate: collectionDate ? new Date(collectionDate) : new Date()
        }
      });
    }

    // Create Collection
    const newCollection = await prisma.collection.create({
      data: {
        receiptNo,
        donorId: donor.id,
        donorName: cleanName,
        mobile: cleanMobile,
        address: cleanAddress,
        amount: numAmount,
        paymentMode,
        purpose,
        collectorId: assignedCollectorId,
        collectorName: resolvedCollectorName,
        collectionDate: collectionDate ? new Date(collectionDate) : new Date(),
        status: 'ACTIVE',
        createdById: req.user.id
      },
      include: {
        collector: { select: { id: true, name: true, mobile: true, isActive: true } },
        createdBy: { select: { id: true, name: true, role: true } },
        donor: true
      }
    });

    // Audit log
    await logAudit({
      req,
      action: 'CREATE_COLLECTION',
      entity: 'Collection',
      entityId: newCollection.id,
      description: `Collection receipt ${receiptNo} for ₹${numAmount} created for ${cleanName} by ${req.user.name}.`,
      details: { receiptNo, amount: numAmount, paymentMode, donorId: donor.id }
    });

    // Words representation
    const amountInWordsEn = numberToWordsEnglish(numAmount);
    const amountInWordsMr = numberToWordsMarathi(numAmount);

    res.status(201).json({
      success: true,
      message: 'Collection successfully recorded! पावती यशस्वीपणे तयार झाली.',
      data: {
        ...newCollection,
        amountInWordsEn,
        amountInWordsMr,
        settings
      }
    });
  } catch (error) {
    console.error('createCollection error:', error);
    res.status(500).json({ success: false, message: 'Failed to record collection.' });
  }
}

/**
 * Get Collection by ID
 */
async function getCollectionById(req, res) {
  try {
    const { id } = req.params;

    const collection = await prisma.collection.findUnique({
      where: { id },
      include: {
        collector: { select: { id: true, name: true, mobile: true } },
        createdBy: { select: { id: true, name: true } },
        donor: true
      }
    });

    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection receipt not found.' });
    }

    const settings = await prisma.settings.findUnique({ where: { id: 'default' } });
    const amountInWordsEn = numberToWordsEnglish(collection.amount);
    const amountInWordsMr = numberToWordsMarathi(collection.amount);

    res.json({
      success: true,
      data: {
        ...collection,
        amountInWordsEn,
        amountInWordsMr,
        settings
      }
    });
  } catch (error) {
    console.error('getCollectionById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch collection receipt.' });
  }
}

/**
 * Update Collection details (Address / Purpose / Collector)
 */
async function updateCollection(req, res) {
  try {
    const { id } = req.params;
    const { address, purpose, collectorId } = req.body;

    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    if (existing.status === 'VOID') {
      return res.status(400).json({ success: false, message: 'Cannot edit a voided collection.' });
    }

    let updateData = {};
    if (address !== undefined) updateData.address = address;
    if (purpose !== undefined) updateData.purpose = purpose;
    if (collectorId) {
      const col = await prisma.collector.findUnique({ where: { id: collectorId } });
      if (col) {
        updateData.collectorId = col.id;
        updateData.collectorName = col.name;
      }
    }

    const updated = await prisma.collection.update({
      where: { id },
      data: updateData
    });

    await logAudit({
      req,
      action: 'UPDATE_COLLECTION',
      entity: 'Collection',
      entityId: id,
      description: `Collection ${existing.receiptNo} updated by ${req.user.name}.`,
      details: updateData
    });

    res.json({ success: true, message: 'Collection updated successfully.', data: updated });
  } catch (error) {
    console.error('updateCollection error:', error);
    res.status(500).json({ success: false, message: 'Failed to update collection.' });
  }
}

/**
 * Void a Collection safely with mandatory reason
 */
async function voidCollection(req, res) {
  try {
    const { id } = req.params;
    const { voidReason } = req.body;

    if (!voidReason || !voidReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid reason is required to void this collection. पावती रद्द करण्याचे कारण देणे आवश्यक आहे.'
      });
    }

    const collection = await prisma.collection.findUnique({ where: { id } });
    if (!collection) {
      return res.status(404).json({ success: false, message: 'Collection not found.' });
    }

    if (collection.status === 'VOID') {
      return res.status(400).json({ success: false, message: 'Collection is already marked VOID.' });
    }

    // Mark as VOID
    const voided = await prisma.collection.update({
      where: { id },
      data: {
        status: 'VOID',
        voidReason: voidReason.trim(),
        voidedBy: req.user.name,
        voidedAt: new Date()
      }
    });

    // Recalculate donor's total contribution
    if (collection.donorId) {
      const activeDonations = await prisma.collection.aggregate({
        where: { donorId: collection.donorId, status: 'ACTIVE' },
        _sum: { amount: true },
        _count: { id: true }
      });

      const latest = await prisma.collection.findFirst({
        where: { donorId: collection.donorId, status: 'ACTIVE' },
        orderBy: { collectionDate: 'desc' }
      });

      await prisma.donor.update({
        where: { id: collection.donorId },
        data: {
          totalContribution: activeDonations._sum.amount || 0,
          donationCount: activeDonations._count.id || 0,
          lastDonationDate: latest ? latest.collectionDate : null
        }
      });
    }

    await logAudit({
      req,
      action: 'VOID_COLLECTION',
      entity: 'Collection',
      entityId: id,
      description: `Collection ${collection.receiptNo} (₹${collection.amount}) was VOIDED by ${req.user.name}. Reason: ${voidReason.trim()}`,
      details: { receiptNo: collection.receiptNo, amount: collection.amount, voidReason }
    });

    res.json({
      success: true,
      message: `Collection ${collection.receiptNo} has been VOIDED successfully.`,
      data: voided
    });
  } catch (error) {
    console.error('voidCollection error:', error);
    res.status(500).json({ success: false, message: 'Failed to void collection.' });
  }
}

module.exports = {
  listCollections,
  createCollection,
  getCollectionById,
  updateCollection,
  voidCollection
};
