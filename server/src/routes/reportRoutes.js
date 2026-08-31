const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { authenticate, requireRoles } = require('../middleware/auth');

router.get('/dashboard', authenticate, reportController.getDashboardStats);
router.get('/daily', authenticate, requireRoles('ADMIN', 'TREASURER'), reportController.getDailyReport);
router.get('/monthly', authenticate, requireRoles('ADMIN', 'TREASURER'), reportController.getMonthlyReport);

module.exports = router;
