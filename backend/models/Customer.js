const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    loanNo: {
      type: String,
      required: [true, 'Loan Number is required'],
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Customer name is required'],
      trim: true
    },
    email: {
      type: String,
      required: [true, 'Customer email is required'],
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true
    },
    vehicleNo: {
      type: String,
      required: [true, 'Vehicle Number is required'],
      trim: true
    },
    vehicleModel: {
      type: String,
      required: [true, 'Type of model is required'],
      trim: true
    },
    modelYear: {
      type: String,
      required: [true, 'Year of model is required'],
      default: '2026',
      trim: true
    },
    // Optional Vehicle Documents & Compliance
    vehicleInsurance: {
      type: String,
      default: '',
      trim: true
    },
    vehicleFitness: {
      type: String,
      default: '',
      trim: true
    },
    pucDetails: {
      type: String,
      default: '',
      trim: true
    },
    roadTax: {
      type: String,
      default: '',
      trim: true
    },
    loanAmount: {
      type: Number,
      required: [true, 'Loan amount is required'],
      min: [0, 'Loan amount must be positive']
    },
    interestRate: {
      type: Number,
      required: [true, 'Rate of interest is required'],
      default: 1.5
    },
    noOfInstallments: {
      type: Number,
      required: [true, 'Number of installments is required'],
      min: [0, 'Number of installments must be positive'],
      default: 0
    },
    // Loan Math Calculations
    monthlyInterest: {
      type: Number,
      default: 0
    },
    totalInterest: {
      type: Number,
      default: 0
    },
    totalAmount: {
      type: Number,
      default: 0
    },
    installmentAmount: {
      type: Number,
      required: [true, 'Amount of installment is required'],
      min: [0, 'Amount of installment must be positive']
    },
    monthlyEmi: {
      type: Number,
      default: 0
    },
    agreementDate: {
      type: Date,
      required: [true, 'Date of agreement is required'],
      default: Date.now
    },
    // Payment Tracking
    totalPaid: {
      type: Number,
      default: 0,
      min: [0, 'Total paid cannot be negative']
    },
    paidInstallmentsCount: {
      type: Number,
      default: 0
    },
    status: {
      type: String,
      enum: ['Active', 'Pending', 'Approved', 'Rejected'],
      default: 'Active'
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

module.exports = mongoose.model('Customer', customerSchema);
