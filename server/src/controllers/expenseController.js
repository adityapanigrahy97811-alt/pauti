const prisma = require('../config/prisma');
const { generateExpenseId } = require('../utils/helpers');
const { logAudit } = require('../middleware/audit');

/**
 * List Expenses with Filtering & Pagination
 */
async function listExpenses(req, res) {
  try {
    const {
      page = 1,
      limit = 10,
      search = '',
      category,
      paymentMode,
      startDate,
      endDate,
      status = 'ALL'
    } = req.query;

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const where = {};

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (paymentMode && paymentMode !== 'ALL') {
      where.paymentMode = paymentMode;
    }

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) {
        where.expenseDate.gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.expenseDate.lte = end;
      }
    }

    if (search.trim()) {
      const q = search.trim();
      where.OR = [
        { expenseId: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { paidBy: { contains: q, mode: 'insensitive' } },
        { notes: { contains: q, mode: 'insensitive' } }
      ];
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        skip,
        take,
        orderBy: { expenseDate: 'desc' },
        include: {
          createdBy: { select: { id: true, name: true } }
        }
      }),
      prisma.expense.count({ where })
    ]);

    const activeTotalAggregate = await prisma.expense.aggregate({
      where: { ...where, status: 'ACTIVE' },
      _sum: { amount: true }
    });

    res.json({
      success: true,
      data: expenses,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take) || 1
      },
      filteredActiveTotal: activeTotalAggregate._sum.amount || 0
    });
  } catch (error) {
    console.error('listExpenses error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expenses.' });
  }
}

/**
 * Create a New Expense
 */
async function createExpense(req, res) {
  try {
    const {
      category,
      description,
      amount,
      paymentMode = 'CASH',
      expenseDate,
      paidBy,
      notes
    } = req.body;

    if (!category || !description || !amount || !paidBy) {
      return res.status(400).json({
        success: false,
        message: 'Category, description, amount, and paid-by are required fields.'
      });
    }

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Expense amount must be greater than 0.'
      });
    }

    const expenseId = await generateExpenseId(2026, 'EXP');

    const expense = await prisma.expense.create({
      data: {
        expenseId,
        category: category.trim(),
        description: description.trim(),
        amount: numAmount,
        paymentMode,
        expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
        paidBy: paidBy.trim(),
        notes: notes ? notes.trim() : null,
        status: 'ACTIVE',
        createdById: req.user.id
      },
      include: {
        createdBy: { select: { id: true, name: true } }
      }
    });

    await logAudit({
      req,
      action: 'CREATE_EXPENSE',
      entity: 'Expense',
      entityId: expense.id,
      description: `Expense ${expenseId} (₹${numAmount} - ${category}) recorded by ${req.user.name}.`,
      details: { expenseId, category, amount: numAmount, paidBy }
    });

    res.status(201).json({
      success: true,
      message: 'Expense recorded successfully. खर्च यशस्वीपणे नोंदवला गेला.',
      data: expense
    });
  } catch (error) {
    console.error('createExpense error:', error);
    res.status(500).json({ success: false, message: 'Failed to record expense.' });
  }
}

/**
 * Get Expense by ID
 */
async function getExpenseById(req, res) {
  try {
    const { id } = req.params;
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { createdBy: { select: { id: true, name: true } } }
    });

    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    res.json({ success: true, data: expense });
  } catch (error) {
    console.error('getExpenseById error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch expense details.' });
  }
}

/**
 * Update Expense
 */
async function updateExpense(req, res) {
  try {
    const { id } = req.params;
    const { category, description, amount, paymentMode, expenseDate, paidBy, notes } = req.body;

    const existing = await prisma.expense.findUnique({ where: { id } });
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    if (existing.status === 'VOID') {
      return res.status(400).json({ success: false, message: 'Cannot edit a voided expense.' });
    }

    const numAmount = amount ? parseFloat(amount) : existing.amount;

    const updated = await prisma.expense.update({
      where: { id },
      data: {
        category: category || existing.category,
        description: description || existing.description,
        amount: numAmount,
        paymentMode: paymentMode || existing.paymentMode,
        expenseDate: expenseDate ? new Date(expenseDate) : existing.expenseDate,
        paidBy: paidBy || existing.paidBy,
        notes: notes !== undefined ? notes : existing.notes
      }
    });

    await logAudit({
      req,
      action: 'UPDATE_EXPENSE',
      entity: 'Expense',
      entityId: id,
      description: `Expense ${existing.expenseId} updated by ${req.user.name}.`
    });

    res.json({ success: true, message: 'Expense updated successfully.', data: updated });
  } catch (error) {
    console.error('updateExpense error:', error);
    res.status(500).json({ success: false, message: 'Failed to update expense.' });
  }
}

/**
 * Void an Expense with mandatory reason
 */
async function voidExpense(req, res) {
  try {
    const { id } = req.params;
    const { voidReason } = req.body;

    if (!voidReason || !voidReason.trim()) {
      return res.status(400).json({
        success: false,
        message: 'A valid reason is required to void this expense. खर्च रद्द करण्याचे कारण आवश्यक आहे.'
      });
    }

    const expense = await prisma.expense.findUnique({ where: { id } });
    if (!expense) {
      return res.status(404).json({ success: false, message: 'Expense not found.' });
    }

    if (expense.status === 'VOID') {
      return res.status(400).json({ success: false, message: 'Expense is already marked VOID.' });
    }

    const voided = await prisma.expense.update({
      where: { id },
      data: {
        status: 'VOID',
        voidReason: voidReason.trim(),
        voidedBy: req.user.name,
        voidedAt: new Date()
      }
    });

    await logAudit({
      req,
      action: 'VOID_EXPENSE',
      entity: 'Expense',
      entityId: id,
      description: `Expense ${expense.expenseId} (₹${expense.amount}) was VOIDED by ${req.user.name}. Reason: ${voidReason.trim()}`,
      details: { expenseId: expense.expenseId, amount: expense.amount, voidReason }
    });

    res.json({
      success: true,
      message: `Expense ${expense.expenseId} VOIDED successfully.`,
      data: voided
    });
  } catch (error) {
    console.error('voidExpense error:', error);
    res.status(500).json({ success: false, message: 'Failed to void expense.' });
  }
}

module.exports = {
  listExpenses,
  createExpense,
  getExpenseById,
  updateExpense,
  voidExpense
};
