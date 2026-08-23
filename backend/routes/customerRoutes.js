const express = require('express');
const router = express.Router();
const { addCustomer, bulkImportCustomers, getCustomers, deleteCustomer } = require('../controllers/customerController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All customer routes are protected for authenticated admins

router.route('/')
  .post(addCustomer)
  .get(getCustomers);

router.post('/bulk-import', bulkImportCustomers);

router.route('/:id')
  .delete(deleteCustomer);

module.exports = router;
