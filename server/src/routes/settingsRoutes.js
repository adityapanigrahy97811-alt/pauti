const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settingsController');
const { authenticate, requireRoles } = require('../middleware/auth');

router.get('/', settingsController.getSettings);
router.put('/', authenticate, requireRoles('ADMIN'), settingsController.updateSettings);

module.exports = router;
