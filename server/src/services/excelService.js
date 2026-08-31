const ExcelJS = require('exceljs');
const { formatDate, formatDateTime } = require('../utils/helpers');

// Styling constants
const THEME_HEADER_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFE67E22' } // Warm Saffron / Gold
};

const THEME_HEADER_DARK_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FF1E1E28' } // Charcoal
};

const THEME_HEADER_GOLD_FILL = {
  type: 'pattern',
  pattern: 'solid',
  fgColor: { argb: 'FFD4AF37' } // Antique Gold
};

const BORDER_THIN = {
  top: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  left: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  bottom: { style: 'thin', color: { argb: 'FFD1D5DB' } },
  right: { style: 'thin', color: { argb: 'FFD1D5DB' } }
};

const BORDER_HEADER = {
  top: { style: 'medium', color: { argb: 'FF92400E' } },
  left: { style: 'thin', color: { argb: 'FF92400E' } },
  bottom: { style: 'medium', color: { argb: 'FF92400E' } },
  right: { style: 'thin', color: { argb: 'FF92400E' } }
};

/**
 * Apply auto column widths based on maximum string length in each column
 */
function autoFitColumns(worksheet, minWidth = 12) {
  worksheet.columns.forEach(column => {
    let maxLength = 0;
    column.eachCell({ includeEmpty: true }, (cell, rowNumber) => {
      // Avoid taking large title banner rows into width calculation
      if (rowNumber > 3) {
        const val = cell.value ? cell.value.toString() : '';
        if (val.length > maxLength) {
          maxLength = val.length;
        }
      }
    });
    column.width = Math.max(maxLength + 4, minWidth);
  });
}

/**
 * Build the Complete Multi-Sheet Accounts Excel Workbook
 * Contains 6 sheets: SUMMARY, COLLECTIONS, EXPENSES, DONORS, DAILY SUMMARY, MONTHLY SUMMARY
 */
async function generateCompleteAccountsWorkbook({
  settings,
  collections,
  expenses,
  donors,
  dailySummary,
  monthlySummary,
  summaryTotals
}) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'अष्टविनायक मित्र मंडळ, रोहित कॉलनी, बोईसर';
  workbook.lastModifiedBy = 'Ashtavinayak Mandal System';
  workbook.created = new Date();
  workbook.modified = new Date();

  // ==========================================
  // SHEET 1: SUMMARY
  // ==========================================
  const summarySheet = workbook.addWorksheet('SUMMARY', {
    views: [{ showGridLines: true }]
  });

  // Mandal Title Banner
  summarySheet.mergeCells('B2:G2');
  const bannerCell = summarySheet.getCell('B2');
  bannerCell.value = 'अष्टविनायक मित्र मंडळ, रोहित कॉलनी, बोईसर';
  bannerCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FFFFFFFF' } };
  bannerCell.alignment = { horizontal: 'center', vertical: 'middle' };
  bannerCell.fill = THEME_HEADER_DARK_FILL;
  summarySheet.getRow(2).height = 35;

  // Subtitle
  summarySheet.mergeCells('B3:G3');
  const subCell = summarySheet.getCell('B3');
  subCell.value = '३९ वा गणेशोत्सव (स्थापना : १९८७) — संपूर्ण आर्थिक ताळेबंद / Accounts Summary 2026';
  subCell.font = { name: 'Arial', size: 11, italic: true, color: { argb: 'FFFFFFFF' } };
  subCell.alignment = { horizontal: 'center', vertical: 'middle' };
  subCell.fill = THEME_HEADER_FILL;
  summarySheet.getRow(3).height = 24;

  // Overview Table
  summarySheet.getCell('B5').value = 'वित्तीय विहंगावलोकन / Financial Overview';
  summarySheet.getCell('B5').font = { name: 'Arial', size: 13, bold: true, color: { argb: 'FF92400E' } };

  const summaryRows = [
    ['Mandal Name / मंडळाचे नाव', `${settings?.mandalName || 'अष्टविनायक मित्र मंडळ'} (${settings?.location || 'रोहित कॉलनी, बोईसर'})`],
    ['Festival Year / उत्सव वर्ष', `${settings?.festivalYear || '३९ वा गणेशोत्सव'} (Est. ${settings?.establishedYear || 1987})`],
    ['Export Generated Date / दिनांक', formatDateTime(new Date())],
    ['--------------------------------', '--------------------------------'],
    ['Total Collection / एकूण जमा (₹)', summaryTotals.totalCollection],
    ['Total Expenses / एकूण खर्च (₹)', summaryTotals.totalExpenses],
    ['Current Balance / शिल्लक रक्कम (₹)', summaryTotals.currentBalance],
    ['--------------------------------', '--------------------------------'],
    ['Total Active Donors / एकूण देणगीदार', summaryTotals.totalDonors],
    ['Total Collection Transactions / एकूण पावत्या', summaryTotals.totalTransactions],
    ['Total Expense Vouchers / एकूण खर्च व्हाउचर्स', summaryTotals.totalExpenseVouchers],
    ['--------------------------------', '--------------------------------'],
    ['Cash Collection / रोख जमा (₹)', summaryTotals.cashCollection],
    ['UPI Collection / युपीआय जमा (₹)', summaryTotals.upiCollection],
    ['Bank Transfer / बँक ट्रान्सफर जमा (₹)', summaryTotals.bankCollection]
  ];

  let startRow = 6;
  summaryRows.forEach(([label, value]) => {
    const row = summarySheet.getRow(startRow);
    row.getCell(2).value = label;
    row.getCell(2).font = { name: 'Arial', size: 10, bold: true };
    row.getCell(2).border = BORDER_THIN;
    row.getCell(2).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF9FAFB' } };

    const valCell = row.getCell(3);
    valCell.value = value;
    valCell.font = { name: 'Arial', size: 10, bold: label.includes('(₹)') };
    valCell.border = BORDER_THIN;

    if (typeof value === 'number' && label.includes('(₹)')) {
      valCell.numFmt = '₹#,##0.00';
      if (label.includes('Balance')) {
        valCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFDCFCE7' } }; // Light green
        valCell.font = { name: 'Arial', size: 11, bold: true, color: { argb: 'FF166534' } };
      } else if (label.includes('Expenses')) {
        valCell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF991B1B' } };
      }
    }

    startRow++;
  });

  summarySheet.getColumn(2).width = 40;
  summarySheet.getColumn(3).width = 45;

  // ==========================================
  // SHEET 2: COLLECTIONS
  // ==========================================
  const colSheet = workbook.addWorksheet('Collections', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  colSheet.columns = [
    { header: 'Sr No', key: 'srNo', width: 8 },
    { header: 'Receipt No', key: 'receiptNo', width: 18 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Donor Name', key: 'donorName', width: 26 },
    { header: 'Mobile', key: 'mobile', width: 15 },
    { header: 'Address', key: 'address', width: 30 },
    { header: 'Amount', key: 'amount', width: 16 },
    { header: 'Payment Mode', key: 'paymentMode', width: 16 },
    { header: 'Purpose', key: 'purpose', width: 22 },
    { header: 'Collector', key: 'collector', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Created By', key: 'createdBy', width: 18 },
    { header: 'Created At', key: 'createdAt', width: 20 }
  ];

  // Header row formatting
  const colHeaderRow = colSheet.getRow(1);
  colHeaderRow.height = 26;
  colHeaderRow.eachCell(cell => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = THEME_HEADER_DARK_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = BORDER_HEADER;
  });

  collections.forEach((c, idx) => {
    const row = colSheet.addRow({
      srNo: idx + 1,
      receiptNo: c.receiptNo,
      date: formatDate(c.collectionDate),
      donorName: c.donorName,
      mobile: c.mobile,
      address: c.address || '-',
      amount: c.amount,
      paymentMode: c.paymentMode,
      purpose: c.purpose,
      collector: c.collectorName || (c.collector ? c.collector.name : '-'),
      status: c.status,
      createdBy: c.createdBy ? c.createdBy.name : 'System',
      createdAt: formatDateTime(c.createdAt)
    });

    row.height = 20;
    row.getCell('amount').numFmt = '₹#,##0.00';
    row.getCell('amount').alignment = { horizontal: 'right' };
    row.getCell('srNo').alignment = { horizontal: 'center' };
    row.getCell('date').alignment = { horizontal: 'center' };
    row.getCell('status').alignment = { horizontal: 'center' };
    row.getCell('paymentMode').alignment = { horizontal: 'center' };

    if (c.status === 'VOID') {
      row.eachCell(cell => {
        cell.font = { name: 'Arial', size: 9, strike: true, color: { argb: 'FF9CA3AF' } };
      });
    } else {
      row.eachCell(cell => {
        cell.font = { name: 'Arial', size: 9 };
        cell.border = BORDER_THIN;
      });
    }
  });

  colSheet.autoFilter = 'A1:M1';

  // ==========================================
  // SHEET 3: EXPENSES
  // ==========================================
  const expSheet = workbook.addWorksheet('Expenses', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  expSheet.columns = [
    { header: 'Sr No', key: 'srNo', width: 8 },
    { header: 'Expense ID', key: 'expenseId', width: 16 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Description', key: 'description', width: 35 },
    { header: 'Amount', key: 'amount', width: 16 },
    { header: 'Payment Mode', key: 'paymentMode', width: 16 },
    { header: 'Paid By', key: 'paidBy', width: 22 },
    { header: 'Notes', key: 'notes', width: 25 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Created By', key: 'createdBy', width: 18 },
    { header: 'Created At', key: 'createdAt', width: 20 }
  ];

  const expHeaderRow = expSheet.getRow(1);
  expHeaderRow.height = 26;
  expHeaderRow.eachCell(cell => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = THEME_HEADER_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = BORDER_HEADER;
  });

  expenses.forEach((e, idx) => {
    const row = expSheet.addRow({
      srNo: idx + 1,
      expenseId: e.expenseId,
      date: formatDate(e.expenseDate),
      category: e.category,
      description: e.description,
      amount: e.amount,
      paymentMode: e.paymentMode,
      paidBy: e.paidBy,
      notes: e.notes || '-',
      status: e.status,
      createdBy: e.createdBy ? e.createdBy.name : 'System',
      createdAt: formatDateTime(e.createdAt)
    });

    row.height = 20;
    row.getCell('amount').numFmt = '₹#,##0.00';
    row.getCell('amount').alignment = { horizontal: 'right' };
    row.getCell('srNo').alignment = { horizontal: 'center' };
    row.getCell('date').alignment = { horizontal: 'center' };
    row.getCell('status').alignment = { horizontal: 'center' };
    row.getCell('paymentMode').alignment = { horizontal: 'center' };

    if (e.status === 'VOID') {
      row.eachCell(cell => {
        cell.font = { name: 'Arial', size: 9, strike: true, color: { argb: 'FF9CA3AF' } };
      });
    } else {
      row.eachCell(cell => {
        cell.font = { name: 'Arial', size: 9 };
        cell.border = BORDER_THIN;
      });
    }
  });

  expSheet.autoFilter = 'A1:L1';

  // ==========================================
  // SHEET 4: DONORS
  // ==========================================
  const donorSheet = workbook.addWorksheet('Donors', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  donorSheet.columns = [
    { header: 'Sr No', key: 'srNo', width: 8 },
    { header: 'Donor Name', key: 'name', width: 28 },
    { header: 'Mobile', key: 'mobile', width: 16 },
    { header: 'Address', key: 'address', width: 32 },
    { header: 'Total Contribution', key: 'totalContribution', width: 20 },
    { header: 'Number of Contributions', key: 'donationCount', width: 24 },
    { header: 'Last Contribution Date', key: 'lastDonationDate', width: 22 }
  ];

  const donorHeaderRow = donorSheet.getRow(1);
  donorHeaderRow.height = 26;
  donorHeaderRow.eachCell(cell => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = THEME_HEADER_GOLD_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = BORDER_HEADER;
  });

  donors.forEach((d, idx) => {
    const row = donorSheet.addRow({
      srNo: idx + 1,
      name: d.name,
      mobile: d.mobile,
      address: d.address || '-',
      totalContribution: d.totalContribution || 0,
      donationCount: d.donationCount || 0,
      lastDonationDate: d.lastDonationDate ? formatDate(d.lastDonationDate) : '-'
    });

    row.height = 20;
    row.getCell('totalContribution').numFmt = '₹#,##0.00';
    row.getCell('totalContribution').alignment = { horizontal: 'right' };
    row.getCell('srNo').alignment = { horizontal: 'center' };
    row.getCell('donationCount').alignment = { horizontal: 'center' };
    row.getCell('lastDonationDate').alignment = { horizontal: 'center' };

    row.eachCell(cell => {
      cell.font = { name: 'Arial', size: 9 };
      cell.border = BORDER_THIN;
    });
  });

  donorSheet.autoFilter = 'A1:G1';

  // ==========================================
  // SHEET 5: DAILY SUMMARY
  // ==========================================
  const dailySheet = workbook.addWorksheet('Daily Summary', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  dailySheet.columns = [
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Total Collection', key: 'totalCollection', width: 18 },
    { header: 'Cash', key: 'cash', width: 15 },
    { header: 'UPI', key: 'upi', width: 15 },
    { header: 'Bank Transfer', key: 'bankTransfer', width: 18 },
    { header: 'Total Expenses', key: 'totalExpenses', width: 18 },
    { header: 'Balance', key: 'balance', width: 18 }
  ];

  const dailyHeaderRow = dailySheet.getRow(1);
  dailyHeaderRow.height = 26;
  dailyHeaderRow.eachCell(cell => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = THEME_HEADER_DARK_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = BORDER_HEADER;
  });

  dailySummary.forEach(day => {
    const row = dailySheet.addRow({
      date: day.date,
      totalCollection: day.totalCollection,
      cash: day.cash,
      upi: day.upi,
      bankTransfer: day.bankTransfer,
      totalExpenses: day.totalExpenses,
      balance: day.balance
    });

    row.height = 20;
    ['totalCollection', 'cash', 'upi', 'bankTransfer', 'totalExpenses', 'balance'].forEach(k => {
      row.getCell(k).numFmt = '₹#,##0.00';
      row.getCell(k).alignment = { horizontal: 'right' };
    });
    row.getCell('date').alignment = { horizontal: 'center' };

    row.eachCell(cell => {
      cell.font = { name: 'Arial', size: 9 };
      cell.border = BORDER_THIN;
    });
  });

  dailySheet.autoFilter = 'A1:G1';

  // ==========================================
  // SHEET 6: MONTHLY SUMMARY
  // ==========================================
  const monthlySheet = workbook.addWorksheet('Monthly Summary', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  monthlySheet.columns = [
    { header: 'Month', key: 'month', width: 16 },
    { header: 'Total Collection', key: 'totalCollection', width: 18 },
    { header: 'Cash', key: 'cash', width: 15 },
    { header: 'UPI', key: 'upi', width: 15 },
    { header: 'Bank Transfer', key: 'bankTransfer', width: 18 },
    { header: 'Total Expenses', key: 'totalExpenses', width: 18 },
    { header: 'Net Balance', key: 'netBalance', width: 18 },
    { header: 'Number of Collections', key: 'count', width: 22 }
  ];

  const monthHeaderRow = monthlySheet.getRow(1);
  monthHeaderRow.height = 26;
  monthHeaderRow.eachCell(cell => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = THEME_HEADER_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = BORDER_HEADER;
  });

  monthlySummary.forEach(m => {
    const row = monthlySheet.addRow({
      month: m.month,
      totalCollection: m.totalCollection,
      cash: m.cash,
      upi: m.upi,
      bankTransfer: m.bankTransfer,
      totalExpenses: m.totalExpenses,
      netBalance: m.netBalance,
      count: m.count
    });

    row.height = 20;
    ['totalCollection', 'cash', 'upi', 'bankTransfer', 'totalExpenses', 'netBalance'].forEach(k => {
      row.getCell(k).numFmt = '₹#,##0.00';
      row.getCell(k).alignment = { horizontal: 'right' };
    });
    row.getCell('month').alignment = { horizontal: 'center' };
    row.getCell('count').alignment = { horizontal: 'center' };

    row.eachCell(cell => {
      cell.font = { name: 'Arial', size: 9 };
      cell.border = BORDER_THIN;
    });
  });

  monthlySheet.autoFilter = 'A1:H1';

  return workbook;
}

/**
 * Build Single-Sheet Collections Workbook with Filters
 */
async function generateCollectionsWorkbook(collections, filterInfo = '') {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Collections', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  sheet.columns = [
    { header: 'Sr No', key: 'srNo', width: 8 },
    { header: 'Receipt No', key: 'receiptNo', width: 18 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Donor Name', key: 'donorName', width: 26 },
    { header: 'Mobile', key: 'mobile', width: 15 },
    { header: 'Address', key: 'address', width: 30 },
    { header: 'Amount', key: 'amount', width: 16 },
    { header: 'Payment Mode', key: 'paymentMode', width: 16 },
    { header: 'Purpose', key: 'purpose', width: 22 },
    { header: 'Collector', key: 'collector', width: 20 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Created By', key: 'createdBy', width: 18 },
    { header: 'Created At', key: 'createdAt', width: 20 }
  ];

  const headerRow = sheet.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell(cell => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = THEME_HEADER_DARK_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = BORDER_HEADER;
  });

  collections.forEach((c, idx) => {
    const row = sheet.addRow({
      srNo: idx + 1,
      receiptNo: c.receiptNo,
      date: formatDate(c.collectionDate),
      donorName: c.donorName,
      mobile: c.mobile,
      address: c.address || '-',
      amount: c.amount,
      paymentMode: c.paymentMode,
      purpose: c.purpose,
      collector: c.collectorName || (c.collector ? c.collector.name : '-'),
      status: c.status,
      createdBy: c.createdBy ? c.createdBy.name : 'System',
      createdAt: formatDateTime(c.createdAt)
    });

    row.height = 20;
    row.getCell('amount').numFmt = '₹#,##0.00';
    row.getCell('amount').alignment = { horizontal: 'right' };
    row.getCell('srNo').alignment = { horizontal: 'center' };
    row.getCell('date').alignment = { horizontal: 'center' };

    row.eachCell(cell => {
      cell.font = { name: 'Arial', size: 9 };
      cell.border = BORDER_THIN;
    });
  });

  sheet.autoFilter = 'A1:M1';
  return workbook;
}

/**
 * Build Single-Sheet Expenses Workbook with Filters
 */
async function generateExpensesWorkbook(expenses) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Expenses', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  sheet.columns = [
    { header: 'Sr No', key: 'srNo', width: 8 },
    { header: 'Expense ID', key: 'expenseId', width: 16 },
    { header: 'Date', key: 'date', width: 14 },
    { header: 'Category', key: 'category', width: 18 },
    { header: 'Description', key: 'description', width: 35 },
    { header: 'Amount', key: 'amount', width: 16 },
    { header: 'Payment Mode', key: 'paymentMode', width: 16 },
    { header: 'Paid By', key: 'paidBy', width: 22 },
    { header: 'Notes', key: 'notes', width: 25 },
    { header: 'Status', key: 'status', width: 12 },
    { header: 'Created By', key: 'createdBy', width: 18 },
    { header: 'Created At', key: 'createdAt', width: 20 }
  ];

  const headerRow = sheet.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell(cell => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = THEME_HEADER_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = BORDER_HEADER;
  });

  expenses.forEach((e, idx) => {
    const row = sheet.addRow({
      srNo: idx + 1,
      expenseId: e.expenseId,
      date: formatDate(e.expenseDate),
      category: e.category,
      description: e.description,
      amount: e.amount,
      paymentMode: e.paymentMode,
      paidBy: e.paidBy,
      notes: e.notes || '-',
      status: e.status,
      createdBy: e.createdBy ? e.createdBy.name : 'System',
      createdAt: formatDateTime(e.createdAt)
    });

    row.height = 20;
    row.getCell('amount').numFmt = '₹#,##0.00';
    row.getCell('amount').alignment = { horizontal: 'right' };
    row.getCell('srNo').alignment = { horizontal: 'center' };
    row.getCell('date').alignment = { horizontal: 'center' };

    row.eachCell(cell => {
      cell.font = { name: 'Arial', size: 9 };
      cell.border = BORDER_THIN;
    });
  });

  sheet.autoFilter = 'A1:L1';
  return workbook;
}

/**
 * Build Single-Sheet Donors Workbook
 */
async function generateDonorsWorkbook(donors) {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet('Donors', {
    views: [{ state: 'frozen', ySplit: 1, showGridLines: true }]
  });

  sheet.columns = [
    { header: 'Sr No', key: 'srNo', width: 8 },
    { header: 'Donor Name', key: 'name', width: 28 },
    { header: 'Mobile', key: 'mobile', width: 16 },
    { header: 'Address', key: 'address', width: 32 },
    { header: 'Total Contribution', key: 'totalContribution', width: 20 },
    { header: 'Number of Contributions', key: 'donationCount', width: 24 },
    { header: 'Last Contribution Date', key: 'lastDonationDate', width: 22 }
  ];

  const headerRow = sheet.getRow(1);
  headerRow.height = 26;
  headerRow.eachCell(cell => {
    cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FFFFFFFF' } };
    cell.fill = THEME_HEADER_GOLD_FILL;
    cell.alignment = { horizontal: 'center', vertical: 'middle' };
    cell.border = BORDER_HEADER;
  });

  donors.forEach((d, idx) => {
    const row = sheet.addRow({
      srNo: idx + 1,
      name: d.name,
      mobile: d.mobile,
      address: d.address || '-',
      totalContribution: d.totalContribution || 0,
      donationCount: d.donationCount || 0,
      lastDonationDate: d.lastDonationDate ? formatDate(d.lastDonationDate) : '-'
    });

    row.height = 20;
    row.getCell('totalContribution').numFmt = '₹#,##0.00';
    row.getCell('totalContribution').alignment = { horizontal: 'right' };
    row.getCell('srNo').alignment = { horizontal: 'center' };

    row.eachCell(cell => {
      cell.font = { name: 'Arial', size: 9 };
      cell.border = BORDER_THIN;
    });
  });

  sheet.autoFilter = 'A1:G1';
  return workbook;
}

module.exports = {
  generateCompleteAccountsWorkbook,
  generateCollectionsWorkbook,
  generateExpensesWorkbook,
  generateDonorsWorkbook
};
