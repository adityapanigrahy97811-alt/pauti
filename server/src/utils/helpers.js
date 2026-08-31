const prisma = require('../config/prisma');

/**
 * Generate next atomic sequential receipt number (e.g. MNDL-2026-0001)
 */
async function generateReceiptNumber(year = 2026, prefix = 'MNDL') {
  const counterId = `receipt_${year}`;
  
  // Use Prisma transaction to atomically update sequence
  const counter = await prisma.$transaction(async (tx) => {
    let record = await tx.counter.findUnique({
      where: { id: counterId }
    });

    if (!record) {
      // Find highest existing receipt sequence if any
      const lastCollection = await tx.collection.findFirst({
        where: {
          receiptNo: {
            startsWith: `${prefix}-${year}-`
          }
        },
        orderBy: { receiptNo: 'desc' }
      });

      let currentSeq = 0;
      if (lastCollection && lastCollection.receiptNo) {
        const parts = lastCollection.receiptNo.split('-');
        const parsed = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(parsed)) currentSeq = parsed;
      }

      record = await tx.counter.create({
        data: {
          id: counterId,
          seq: currentSeq + 1
        }
      });
      return record;
    } else {
      record = await tx.counter.update({
        where: { id: counterId },
        data: { seq: { increment: 1 } }
      });
      return record;
    }
  });

  const paddedSeq = String(counter.seq).padStart(4, '0');
  return `${prefix}-${year}-${paddedSeq}`;
}

/**
 * Generate next atomic sequential expense ID (e.g. EXP-2026-0001)
 */
async function generateExpenseId(year = 2026, prefix = 'EXP') {
  const counterId = `expense_${year}`;

  const counter = await prisma.$transaction(async (tx) => {
    let record = await tx.counter.findUnique({
      where: { id: counterId }
    });

    if (!record) {
      const lastExpense = await tx.expense.findFirst({
        where: {
          expenseId: {
            startsWith: `${prefix}-${year}-`
          }
        },
        orderBy: { expenseId: 'desc' }
      });

      let currentSeq = 0;
      if (lastExpense && lastExpense.expenseId) {
        const parts = lastExpense.expenseId.split('-');
        const parsed = parseInt(parts[parts.length - 1], 10);
        if (!isNaN(parsed)) currentSeq = parsed;
      }

      record = await tx.counter.create({
        data: {
          id: counterId,
          seq: currentSeq + 1
        }
      });
      return record;
    } else {
      record = await tx.counter.update({
        where: { id: counterId },
        data: { seq: { increment: 1 } }
      });
      return record;
    }
  });

  const paddedSeq = String(counter.seq).padStart(4, '0');
  return `${prefix}-${year}-${paddedSeq}`;
}

/**
 * Format a Date object to DD/MM/YYYY
 */
function formatDate(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Format a Date object to DD/MM/YYYY HH:mm
 */
function formatDateTime(date) {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  return `${day}/${month}/${year} ${hours}:${minutes}`;
}

module.exports = {
  generateReceiptNumber,
  generateExpenseId,
  formatDate,
  formatDateTime
};
