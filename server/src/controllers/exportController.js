const prisma = require('../config/prisma');
const {
  generateCompleteAccountsWorkbook,
  generateCollectionsWorkbook,
  generateExpensesWorkbook,
  generateDonorsWorkbook
} = require('../services/excelService');
const { formatDate } = require('../utils/helpers');
const { logAudit } = require('../middleware/audit');

/**
 * Export Complete Multi-Sheet Accounts Excel (.xlsx)
 * Primary File: Ashtavinayak_Mandal_Accounts_2026.xlsx
 */
async function exportCompleteAccounts(req, res) {
  try {
    const [settings, collections, expenses, donors] = await Promise.all([
      prisma.settings.findUnique({ where: { id: 'default' } }),
      prisma.collection.findMany({
        orderBy: { collectionDate: 'asc' },
        include: {
          collector: { select: { name: true } },
          createdBy: { select: { name: true } }
        }
      }),
      prisma.expense.findMany({
        orderBy: { expenseDate: 'asc' },
        include: {
          createdBy: { select: { name: true } }
        }
      }),
      prisma.donor.findMany({
        orderBy: { totalContribution: 'desc' }
      })
    ]);

    // Active calculations (VOID excluded from summary totals)
    let totalCollection = 0;
    let cashCollection = 0;
    let upiCollection = 0;
    let bankCollection = 0;
    let totalActiveTransactions = 0;

    collections.forEach(c => {
      if (c.status === 'ACTIVE') {
        totalCollection += c.amount;
        totalActiveTransactions++;
        if (c.paymentMode === 'CASH') cashCollection += c.amount;
        else if (c.paymentMode === 'UPI') upiCollection += c.amount;
        else if (c.paymentMode === 'BANK_TRANSFER') bankCollection += c.amount;
      }
    });

    let totalExpenses = 0;
    let totalActiveExpenseVouchers = 0;
    expenses.forEach(e => {
      if (e.status === 'ACTIVE') {
        totalExpenses += e.amount;
        totalActiveExpenseVouchers++;
      }
    });

    const currentBalance = totalCollection - totalExpenses;

    const summaryTotals = {
      totalCollection,
      totalExpenses,
      currentBalance,
      totalDonors: donors.length,
      totalTransactions: totalActiveTransactions,
      totalExpenseVouchers: totalActiveExpenseVouchers,
      cashCollection,
      upiCollection,
      bankCollection
    };

    // Calculate Daily Summary
    const daysMap = {};
    collections.forEach(c => {
      if (c.status === 'ACTIVE') {
        const dStr = formatDate(c.collectionDate);
        if (!daysMap[dStr]) {
          daysMap[dStr] = { date: dStr, totalCollection: 0, cash: 0, upi: 0, bankTransfer: 0, totalExpenses: 0, balance: 0, rawDate: c.collectionDate };
        }
        daysMap[dStr].totalCollection += c.amount;
        if (c.paymentMode === 'CASH') daysMap[dStr].cash += c.amount;
        else if (c.paymentMode === 'UPI') daysMap[dStr].upi += c.amount;
        else if (c.paymentMode === 'BANK_TRANSFER') daysMap[dStr].bankTransfer += c.amount;
      }
    });

    expenses.forEach(e => {
      if (e.status === 'ACTIVE') {
        const dStr = formatDate(e.expenseDate);
        if (!daysMap[dStr]) {
          daysMap[dStr] = { date: dStr, totalCollection: 0, cash: 0, upi: 0, bankTransfer: 0, totalExpenses: 0, balance: 0, rawDate: e.expenseDate };
        }
        daysMap[dStr].totalExpenses += e.amount;
      }
    });

    const dailySummary = Object.values(daysMap)
      .map(d => ({ ...d, balance: d.totalCollection - d.totalExpenses }))
      .sort((a, b) => new Date(a.rawDate) - new Date(b.rawDate));

    // Calculate Monthly Summary
    const monthsMap = {};
    collections.forEach(c => {
      if (c.status === 'ACTIVE') {
        const d = new Date(c.collectionDate);
        const mStr = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
        if (!monthsMap[mStr]) {
          monthsMap[mStr] = { month: mStr, totalCollection: 0, cash: 0, upi: 0, bankTransfer: 0, totalExpenses: 0, count: 0 };
        }
        monthsMap[mStr].totalCollection += c.amount;
        monthsMap[mStr].count++;
        if (c.paymentMode === 'CASH') monthsMap[mStr].cash += c.amount;
        else if (c.paymentMode === 'UPI') monthsMap[mStr].upi += c.amount;
        else if (c.paymentMode === 'BANK_TRANSFER') monthsMap[mStr].bankTransfer += c.amount;
      }
    });

    expenses.forEach(e => {
      if (e.status === 'ACTIVE') {
        const d = new Date(e.expenseDate);
        const mStr = `${d.toLocaleString('default', { month: 'short' })} ${d.getFullYear()}`;
        if (!monthsMap[mStr]) {
          monthsMap[mStr] = { month: mStr, totalCollection: 0, cash: 0, upi: 0, bankTransfer: 0, totalExpenses: 0, count: 0 };
        }
        monthsMap[mStr].totalExpenses += e.amount;
      }
    });

    const monthlySummary = Object.values(monthsMap).map(m => ({
      ...m,
      netBalance: m.totalCollection - m.totalExpenses
    }));

    const workbook = await generateCompleteAccountsWorkbook({
      settings,
      collections,
      expenses,
      donors,
      dailySummary,
      monthlySummary,
      summaryTotals
    });

    const filename = 'Ashtavinayak_Mandal_Accounts_2026.xlsx';
    const buffer = await workbook.xlsx.writeBuffer();

    await logAudit({
      req,
      action: 'EXPORT_EXCEL',
      entity: 'Export',
      description: `Complete Accounts Excel exported by ${req.user.name}.`,
      details: { exportType: 'COMPLETE_ACCOUNTS', filename }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('exportCompleteAccounts error:', error);
    res.status(500).json({ success: false, message: 'Failed to generate Complete Accounts Excel.' });
  }
}

/**
 * Export Collections Excel (supports filtering)
 */
async function exportCollections(req, res) {
  try {
    const { startDate, endDate, paymentMode, collectorId, purpose, status = 'ALL' } = req.query;
    const where = {};

    if (status && status !== 'ALL') where.status = status;
    if (paymentMode && paymentMode !== 'ALL') where.paymentMode = paymentMode;
    if (collectorId) where.collectorId = collectorId;
    if (purpose && purpose !== 'ALL') where.purpose = purpose;

    if (startDate || endDate) {
      where.collectionDate = {};
      if (startDate) where.collectionDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.collectionDate.lte = end;
      }
    }

    const collections = await prisma.collection.findMany({
      where,
      orderBy: { collectionDate: 'desc' },
      include: {
        collector: { select: { name: true } },
        createdBy: { select: { name: true } }
      }
    });

    const workbook = await generateCollectionsWorkbook(collections);
    const filename = `Collections_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();

    await logAudit({
      req,
      action: 'EXPORT_EXCEL',
      entity: 'Export',
      description: `Collections Excel exported (${collections.length} records) by ${req.user.name}.`,
      details: { exportType: 'COLLECTIONS', count: collections.length, filters: req.query }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('exportCollections error:', error);
    res.status(500).json({ success: false, message: 'Failed to export collections Excel.' });
  }
}

/**
 * Export Expenses Excel (supports filtering)
 */
async function exportExpenses(req, res) {
  try {
    const { startDate, endDate, category, paymentMode, status = 'ALL' } = req.query;
    const where = {};

    if (status && status !== 'ALL') where.status = status;
    if (category && category !== 'ALL') where.category = category;
    if (paymentMode && paymentMode !== 'ALL') where.paymentMode = paymentMode;

    if (startDate || endDate) {
      where.expenseDate = {};
      if (startDate) where.expenseDate.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.expenseDate.lte = end;
      }
    }

    const expenses = await prisma.expense.findMany({
      where,
      orderBy: { expenseDate: 'desc' },
      include: { createdBy: { select: { name: true } } }
    });

    const workbook = await generateExpensesWorkbook(expenses);
    const filename = `Expenses_Export_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();

    await logAudit({
      req,
      action: 'EXPORT_EXCEL',
      entity: 'Export',
      description: `Expenses Excel exported (${expenses.length} records) by ${req.user.name}.`,
      details: { exportType: 'EXPENSES', count: expenses.length, filters: req.query }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('exportExpenses error:', error);
    res.status(500).json({ success: false, message: 'Failed to export expenses Excel.' });
  }
}

/**
 * Export Donors Excel
 */
async function exportDonors(req, res) {
  try {
    const donors = await prisma.donor.findMany({
      orderBy: { totalContribution: 'desc' }
    });

    const workbook = await generateDonorsWorkbook(donors);
    const filename = `Donors_Directory_${new Date().toISOString().slice(0, 10)}.xlsx`;
    const buffer = await workbook.xlsx.writeBuffer();

    await logAudit({
      req,
      action: 'EXPORT_EXCEL',
      entity: 'Export',
      description: `Donors Excel exported (${donors.length} donors) by ${req.user.name}.`,
      details: { exportType: 'DONORS', count: donors.length }
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Length', buffer.length);
    return res.send(Buffer.from(buffer));
  } catch (error) {
    console.error('exportDonors error:', error);
    res.status(500).json({ success: false, message: 'Failed to export donors Excel.' });
  }
}

module.exports = {
  exportCompleteAccounts,
  exportCollections,
  exportExpenses,
  exportDonors
};
