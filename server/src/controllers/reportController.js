const prisma = require('../config/prisma');
const { formatDate } = require('../utils/helpers');

/**
 * Main Dashboard Stats and Charts
 */
async function getDashboardStats(req, res) {
  try {
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
    const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    // 1. Core Totals
    const [
      totalColAgg,
      totalExpAgg,
      todayColAgg,
      todayExpAgg,
      monthColAgg,
      totalDonorsCount,
      totalTransactionsCount
    ] = await Promise.all([
      prisma.collection.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { status: 'ACTIVE' },
        _sum: { amount: true }
      }),
      prisma.collection.aggregate({
        where: {
          status: 'ACTIVE',
          collectionDate: { gte: todayStart, lte: todayEnd }
        },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: {
          status: 'ACTIVE',
          expenseDate: { gte: todayStart, lte: todayEnd }
        },
        _sum: { amount: true }
      }),
      prisma.collection.aggregate({
        where: {
          status: 'ACTIVE',
          collectionDate: { gte: monthStart, lte: monthEnd }
        },
        _sum: { amount: true }
      }),
      prisma.donor.count(),
      prisma.collection.count({ where: { status: 'ACTIVE' } })
    ]);

    const totalCollection = totalColAgg._sum.amount || 0;
    const totalExpenses = totalExpAgg._sum.amount || 0;
    const currentBalance = totalCollection - totalExpenses;
    const todayCollection = todayColAgg._sum.amount || 0;
    const todayExpenses = todayExpAgg._sum.amount || 0;
    const thisMonthCollection = monthColAgg._sum.amount || 0;

    // 2. Payment Modes Breakdown
    const [cashAgg, upiAgg, bankAgg] = await Promise.all([
      prisma.collection.aggregate({
        where: { status: 'ACTIVE', paymentMode: 'CASH' },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.collection.aggregate({
        where: { status: 'ACTIVE', paymentMode: 'UPI' },
        _sum: { amount: true },
        _count: { id: true }
      }),
      prisma.collection.aggregate({
        where: { status: 'ACTIVE', paymentMode: 'BANK_TRANSFER' },
        _sum: { amount: true },
        _count: { id: true }
      })
    ]);

    const cashAmount = cashAgg._sum.amount || 0;
    const upiAmount = upiAgg._sum.amount || 0;
    const bankAmount = bankAgg._sum.amount || 0;

    const paymentModes = [
      {
        name: 'Cash / रोख',
        value: cashAmount,
        count: cashAgg._count.id || 0,
        percentage: totalCollection > 0 ? ((cashAmount / totalCollection) * 100).toFixed(1) : 0,
        color: '#E05A00' // Saffron
      },
      {
        name: 'UPI / क्यूआर कोड',
        value: upiAmount,
        count: upiAgg._count.id || 0,
        percentage: totalCollection > 0 ? ((upiAmount / totalCollection) * 100).toFixed(1) : 0,
        color: '#D4AF37' // Antique Gold
      },
      {
        name: 'Bank Transfer / बँक ट्रान्सफर',
        value: bankAmount,
        count: bankAgg._count.id || 0,
        percentage: totalCollection > 0 ? ((bankAmount / totalCollection) * 100).toFixed(1) : 0,
        color: '#2563EB' // Royal Blue
      }
    ];

    // 3. Expense Categories Breakdown
    const expensesByCategory = await prisma.expense.groupBy({
      by: ['category'],
      where: { status: 'ACTIVE' },
      _sum: { amount: true },
      _count: { id: true }
    });

    const categoryData = expensesByCategory.map(item => ({
      category: item.category,
      amount: item._sum.amount || 0,
      count: item._count.id || 0,
      percentage: totalExpenses > 0 ? (((item._sum.amount || 0) / totalExpenses) * 100).toFixed(1) : 0
    })).sort((a, b) => b.amount - a.amount);

    // 4. Daily Timeline (Last 14 days)
    const timelineDays = 14;
    const timeline = [];
    for (let i = timelineDays - 1; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const start = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 0, 0, 0);
      const end = new Date(d.getFullYear(), d.getMonth(), d.getDate(), 23, 59, 59, 999);

      const [cAgg, eAgg] = await Promise.all([
        prisma.collection.aggregate({
          where: { status: 'ACTIVE', collectionDate: { gte: start, lte: end } },
          _sum: { amount: true }
        }),
        prisma.expense.aggregate({
          where: { status: 'ACTIVE', expenseDate: { gte: start, lte: end } },
          _sum: { amount: true }
        })
      ]);

      timeline.push({
        date: formatDate(start),
        rawDate: start.toISOString(),
        collections: cAgg._sum.amount || 0,
        expenses: eAgg._sum.amount || 0,
        net: (cAgg._sum.amount || 0) - (eAgg._sum.amount || 0)
      });
    }

    // 5. Recent 6 Collections
    const recentCollections = await prisma.collection.findMany({
      take: 6,
      orderBy: { collectionDate: 'desc' },
      include: {
        collector: { select: { name: true } }
      }
    });

    res.json({
      success: true,
      data: {
        cards: {
          totalCollection,
          totalExpenses,
          currentBalance,
          todayCollection,
          todayExpenses,
          thisMonthCollection,
          totalDonors: totalDonorsCount,
          totalTransactions: totalTransactionsCount
        },
        paymentModes,
        categoryData,
        timeline,
        recentCollections
      }
    });
  } catch (error) {
    console.error('getDashboardStats error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute dashboard analytics.' });
  }
}

/**
 * Daily Financial Report (Opening Balance, Day Collections, Day Expenses, Closing Balance)
 */
async function getDailyReport(req, res) {
  try {
    const { date } = req.query;
    const targetDate = date ? new Date(date) : new Date();

    const dayStart = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 0, 0, 0);
    const dayEnd = new Date(targetDate.getFullYear(), targetDate.getMonth(), targetDate.getDate(), 23, 59, 59, 999);

    // 1. Opening Balance (Collections - Expenses before dayStart)
    const [priorColAgg, priorExpAgg] = await Promise.all([
      prisma.collection.aggregate({
        where: { status: 'ACTIVE', collectionDate: { lt: dayStart } },
        _sum: { amount: true }
      }),
      prisma.expense.aggregate({
        where: { status: 'ACTIVE', expenseDate: { lt: dayStart } },
        _sum: { amount: true }
      })
    ]);

    const openingBalance = (priorColAgg._sum.amount || 0) - (priorExpAgg._sum.amount || 0);

    // 2. Collections for the day (breakdown by Cash, UPI, Bank)
    const dayCollections = await prisma.collection.findMany({
      where: {
        status: 'ACTIVE',
        collectionDate: { gte: dayStart, lte: dayEnd }
      },
      orderBy: { collectionDate: 'asc' },
      include: { collector: { select: { name: true } } }
    });

    let todayCash = 0;
    let todayUpi = 0;
    let todayBank = 0;
    let todayTotalCollection = 0;

    dayCollections.forEach(c => {
      todayTotalCollection += c.amount;
      if (c.paymentMode === 'CASH') todayCash += c.amount;
      else if (c.paymentMode === 'UPI') todayUpi += c.amount;
      else if (c.paymentMode === 'BANK_TRANSFER') todayBank += c.amount;
    });

    // 3. Expenses for the day
    const dayExpenses = await prisma.expense.findMany({
      where: {
        status: 'ACTIVE',
        expenseDate: { gte: dayStart, lte: dayEnd }
      },
      orderBy: { expenseDate: 'asc' }
    });

    let todayTotalExpenses = 0;
    const expensesByCategory = {};

    dayExpenses.forEach(e => {
      todayTotalExpenses += e.amount;
      expensesByCategory[e.category] = (expensesByCategory[e.category] || 0) + e.amount;
    });

    const closingBalance = openingBalance + todayTotalCollection - todayTotalExpenses;

    const settings = await prisma.settings.findUnique({ where: { id: 'default' } });

    res.json({
      success: true,
      data: {
        date: formatDate(dayStart),
        rawDate: dayStart.toISOString(),
        openingBalance,
        todayCollection: todayTotalCollection,
        todayExpenses: todayTotalExpenses,
        closingBalance,
        collectionBreakdown: {
          cash: todayCash,
          upi: todayUpi,
          bankTransfer: todayBank,
          count: dayCollections.length
        },
        expensesBreakdown: {
          byCategory: expensesByCategory,
          count: dayExpenses.length
        },
        collections: dayCollections,
        expenses: dayExpenses,
        settings
      }
    });
  } catch (error) {
    console.error('getDailyReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate daily financial report.' });
  }
}

/**
 * Monthly Financial Summary Report
 */
async function getMonthlyReport(req, res) {
  try {
    // Fetch all active collections and expenses
    const [collections, expenses] = await Promise.all([
      prisma.collection.findMany({
        where: { status: 'ACTIVE' },
        select: { amount: true, paymentMode: true, collectionDate: true }
      }),
      prisma.expense.findMany({
        where: { status: 'ACTIVE' },
        select: { amount: true, expenseDate: true }
      })
    ]);

    const monthsMap = {};

    collections.forEach(c => {
      const d = new Date(c.collectionDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthsMap[key]) {
        monthsMap[key] = {
          month: key,
          totalCollection: 0,
          cash: 0,
          upi: 0,
          bankTransfer: 0,
          totalExpenses: 0,
          count: 0
        };
      }

      monthsMap[key].totalCollection += c.amount;
      monthsMap[key].count += 1;
      if (c.paymentMode === 'CASH') monthsMap[key].cash += c.amount;
      else if (c.paymentMode === 'UPI') monthsMap[key].upi += c.amount;
      else if (c.paymentMode === 'BANK_TRANSFER') monthsMap[key].bankTransfer += c.amount;
    });

    expenses.forEach(e => {
      const d = new Date(e.expenseDate);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      if (!monthsMap[key]) {
        monthsMap[key] = {
          month: key,
          totalCollection: 0,
          cash: 0,
          upi: 0,
          bankTransfer: 0,
          totalExpenses: 0,
          count: 0
        };
      }
      monthsMap[key].totalExpenses += e.amount;
    });

    const report = Object.values(monthsMap)
      .map(m => ({
        ...m,
        netBalance: m.totalCollection - m.totalExpenses
      }))
      .sort((a, b) => b.month.localeCompare(a.month));

    res.json({ success: true, data: report });
  } catch (error) {
    console.error('getMonthlyReport error:', error);
    res.status(500).json({ success: false, message: 'Failed to compute monthly summaries.' });
  }
}

module.exports = {
  getDashboardStats,
  getDailyReport,
  getMonthlyReport
};
