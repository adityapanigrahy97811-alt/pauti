const express = require('express');
const router = express.Router();
const collectionController = require('../controllers/collectionController');
const { authenticate, requireRoles } = require('../middleware/auth');

router.get('/', authenticate, collectionController.listCollections);
router.post('/', authenticate, collectionController.createCollection);
router.get('/:id', authenticate, collectionController.getCollectionById);
router.put('/:id', authenticate, requireRoles('ADMIN', 'TREASURER'), collectionController.updateCollection);
router.patch('/:id/void', authenticate, requireRoles('ADMIN', 'TREASURER'), collectionController.voidCollection);

module.exports = router;
