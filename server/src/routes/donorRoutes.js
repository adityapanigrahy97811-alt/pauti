const express = require('express');
const router = express.Router();
const donorController = require('../controllers/donorController');
const { authenticate, requireRoles } = require('../middleware/auth');

router.get('/suggest', authenticate, donorController.searchDonorSuggestions);
router.get('/', authenticate, donorController.listDonors);
router.get('/:id', authenticate, donorController.getDonorById);
router.post('/', authenticate, donorController.createDonor);
router.put('/:id', authenticate, requireRoles('ADMIN', 'TREASURER'), donorController.updateDonor);

module.exports = router;
