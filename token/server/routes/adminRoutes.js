const express = require('express');
const router = express.Router();
const { getDashboard, getStaff, addStaff, updateStaff, removeStaff, getAnalytics, getCustomers, getCustomerHistory } = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/authMiddleware');

router.use(protect, authorize('admin'));
router.get('/dashboard', getDashboard);
router.get('/analytics', getAnalytics);
router.get('/customers', getCustomers);
router.get('/customer-history', getCustomerHistory);
router.get('/staff', getStaff);
router.post('/staff', addStaff);
router.put('/staff/:id', updateStaff);
router.delete('/staff/:id', removeStaff);

module.exports = router;
