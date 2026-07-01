const router = require('express').Router();
const { getStores, getStore, createStore, updateStore, deleteStore } = require('../controllers/storeController');
const { protect, admin } = require('../middleware/auth');

router.get('/', getStores);
router.get('/:id', getStore);
router.post('/', protect, admin, createStore);
router.put('/:id', protect, admin, updateStore);
router.delete('/:id', protect, admin, deleteStore);

module.exports = router;
