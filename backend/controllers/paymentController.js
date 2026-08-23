const Customer = require('../models/Customer');
const Payment = require('../models/Payment');

// @desc    Record an Installment Payment
// @route   POST /api/payments
// @access  Private (Admin only)
const recordPayment = async (req, res) => {
  try {
    const { customerId, paymentAmount, paymentDate, lateFee, remarks } = req.body;

    if (!customerId || !paymentAmount || Number(paymentAmount) <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Please select a customer and provide a valid payment amount.'
      });
    }

    const customer = await Customer.findById(customerId);
    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    // Effective Total Loan Amount (Principal + Total Interest = 130,000 for 100,000 loan @ 1.5% for 20 inst)
    const effectiveTotalLoan = customer.totalAmount && customer.totalAmount > 0
      ? customer.totalAmount
      : (customer.installmentAmount && customer.noOfInstallments
          ? customer.installmentAmount * customer.noOfInstallments
          : customer.loanAmount || 0);

    const totalInst = customer.noOfInstallments || 0;
    const currentCount = customer.paidInstallmentsCount || 0;
    const currentPaid = customer.totalPaid || 0;

    const isCompleted = (effectiveTotalLoan > 0 && currentPaid >= effectiveTotalLoan) || (totalInst > 0 && currentCount >= totalInst);

    if (isCompleted) {
      return res.status(400).json({
        success: false,
        message: 'Installment Complete! All installments for this customer loan have already been paid in full.'
      });
    }

    const amountPaid = Number(paymentAmount);
    const fee = lateFee ? Number(lateFee) : 0;
    const dateOfPayment = paymentDate ? new Date(paymentDate) : new Date();

    const newTotalPaid = currentPaid + amountPaid;
    const newRemainingAmount = Math.max(0, effectiveTotalLoan - newTotalPaid);
    const newPaidCount = currentCount + 1;

    // Update Customer
    customer.totalPaid = newTotalPaid;
    customer.paidInstallmentsCount = newPaidCount;
    if (!customer.totalAmount || customer.totalAmount === 0) {
      customer.totalAmount = effectiveTotalLoan;
    }

    if (newTotalPaid >= effectiveTotalLoan || (totalInst > 0 && newPaidCount >= totalInst)) {
      customer.status = 'Approved';
    }

    await customer.save();

    // Create Payment Record
    const payment = await Payment.create({
      customer: customer._id,
      loanNo: customer.loanNo,
      paymentAmount: amountPaid,
      paymentDate: dateOfPayment,
      lateFee: fee,
      paidAmountAfterPayment: newTotalPaid,
      remainingAmountAfterPayment: newRemainingAmount,
      remarks: remarks ? remarks.trim() : `Installment #${newPaidCount}`,
      createdBy: req.admin ? req.admin._id : null
    });

    return res.status(201).json({
      success: true,
      message: 'Installment payment recorded successfully!',
      customer,
      payment
    });
  } catch (error) {
    console.error('Record Payment Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to record installment payment.'
    });
  }
};

// @desc    Get Payment History for a Customer
// @route   GET /api/payments/customer/:customerId
// @access  Private (Admin only)
const getPaymentHistory = async (req, res) => {
  try {
    const { customerId } = req.params;
    const payments = await Payment.find({ customer: customerId }).sort({ paymentDate: -1, createdAt: -1 });

    const customer = await Customer.findById(customerId);

    return res.status(200).json({
      success: true,
      count: payments.length,
      customer,
      payments
    });
  } catch (error) {
    console.error('Get Payment History Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve payment history.'
    });
  }
};

module.exports = {
  recordPayment,
  getPaymentHistory
};
