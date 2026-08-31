const express = require('express');
const router = express.Router();
const exportController = require('../controllers/exportController');
const { authenticate, requireRoles } = require('../middleware/auth');

router.get('/complete-accounts', authenticate, requireRoles('ADMIN', 'TREASURER'), exportController.exportCompleteAccounts);
router.get('/collections', authenticate, requireRoles('ADMIN', 'TREASURER'), exportController.exportCollections);
router.get('/expenses', authenticate, requireRoles('ADMIN'), exportController.exportExpenses);
router.get('/donors', authenticate, requireRoles('ADMIN', 'TREASURER'), exportController.exportDonors);

module.exports = router;
