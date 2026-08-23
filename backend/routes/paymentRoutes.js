const express = require('express');
const router = express.Router();
const { recordPayment, getPaymentHistory } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // Protected routes for authenticated admins

router.post('/', recordPayment);
router.get('/customer/:customerId', getPaymentHistory);

module.exports = router;
