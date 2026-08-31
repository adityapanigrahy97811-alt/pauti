const express = require('express');
const router = express.Router();
const collectorController = require('../controllers/collectorController');
const { authenticate, requireRoles } = require('../middleware/auth');

// All endpoints require logged-in user (Admin or Treasurer)
router.use(authenticate);

// GET /api/collectors - List collectors
router.get('/', collectorController.listCollectors);

// GET /api/collectors/:id/statistics - Specific stats
router.get('/:id/statistics', collectorController.getCollectorStatistics);

// Write endpoints restricted to ADMIN and TREASURER
router.post('/', requireRoles('ADMIN', 'TREASURER'), collectorController.createCollector);
router.put('/:id', requireRoles('ADMIN', 'TREASURER'), collectorController.updateCollector);
router.patch('/:id/status', requireRoles('ADMIN', 'TREASURER'), collectorController.toggleStatus);

module.exports = router;
