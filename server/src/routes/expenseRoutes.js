const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const { authenticate, requireRoles } = require('../middleware/auth');

router.get('/', authenticate, requireRoles('ADMIN'), expenseController.listExpenses);
router.post('/', authenticate, requireRoles('ADMIN'), expenseController.createExpense);
router.get('/:id', authenticate, requireRoles('ADMIN'), expenseController.getExpenseById);
router.put('/:id', authenticate, requireRoles('ADMIN'), expenseController.updateExpense);
router.patch('/:id/void', authenticate, requireRoles('ADMIN'), expenseController.voidExpense);

module.exports = router;
