const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate, requireRoles } = require('../middleware/auth');

// Collectors stats can be viewed by Admin and Treasurer
router.get('/collectors-stats', authenticate, requireRoles('ADMIN', 'TREASURER'), userController.getCollectorsStats);

// User CRUD is restricted to ADMIN
router.get('/', authenticate, requireRoles('ADMIN'), userController.listUsers);
router.post('/', authenticate, requireRoles('ADMIN'), userController.createUser);
router.put('/:id', authenticate, requireRoles('ADMIN'), userController.updateUser);
router.patch('/:id/status', authenticate, requireRoles('ADMIN'), userController.toggleUserStatus);
router.patch('/:id/reset-password', authenticate, requireRoles('ADMIN'), userController.resetPassword);

module.exports = router;
