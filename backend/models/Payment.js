const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true
    },
    loanNo: {
      type: String,
      required: true,
      trim: true
    },
    paymentAmount: {
      type: Number,
      required: [true, 'Payment amount is required'],
      min: [0, 'Payment amount cannot be negative']
    },
    paymentDate: {
      type: Date,
      required: [true, 'Payment date is required'],
      default: Date.now
    },
    lateFee: {
      type: Number,
      default: 0,
      min: [0, 'Late fee cannot be negative']
    },
    paidAmountAfterPayment: {
      type: Number,
      required: true
    },
    remainingAmountAfterPayment: {
      type: Number,
      required: true
    },
    remarks: {
      type: String,
      default: '',
      trim: true
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin'
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Payment', paymentSchema);
