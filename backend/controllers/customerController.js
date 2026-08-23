const Customer = require('../models/Customer');

// @desc    Add New Auto Finance Customer
// @route   POST /api/customers
// @access  Private (Admin only)
const addCustomer = async (req, res) => {
  try {
    const { 
      loanNo, 
      name, 
      email, 
      phone, 
      vehicleNo, 
      vehicleModel, 
      modelYear,
      vehicleInsurance,
      vehicleFitness,
      pucDetails,
      roadTax,
      loanAmount, 
      installmentAmount,
      monthlyEmi, 
      noOfInstallments, 
      interestRate,
      agreementDate, 
      status 
    } = req.body;

    const principal = Number(loanAmount) || 0;
    const rate = interestRate !== undefined && interestRate !== '' ? Number(interestRate) : 1.5;
    const nInst = Number(noOfInstallments) || 1;

    const monthlyInterest = (principal * rate) / 100;
    const totalInterest = monthlyInterest * nInst;
    const totalAmount = principal + totalInterest;
    const calculatedInstallmentAmount = nInst > 0 ? Math.round(totalAmount / nInst) : 0;

    const finalInstallmentAmount = installmentAmount ? Number(installmentAmount) : calculatedInstallmentAmount;

    if (!loanNo || !name || !email || !phone || !vehicleNo || !vehicleModel || !loanAmount || !finalInstallmentAmount || !noOfInstallments || !agreementDate) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required customer and loan fields.'
      });
    }

    const customer = await Customer.create({
      loanNo: loanNo.trim(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone.trim(),
      vehicleNo: vehicleNo.trim(),
      vehicleModel: vehicleModel.trim(),
      modelYear: modelYear ? String(modelYear).trim() : '2026',
      vehicleInsurance: vehicleInsurance ? String(vehicleInsurance).trim() : '',
      vehicleFitness: vehicleFitness ? String(vehicleFitness).trim() : '',
      pucDetails: pucDetails ? String(pucDetails).trim() : '',
      roadTax: roadTax ? String(roadTax).trim() : '',
      loanAmount: principal,
      interestRate: rate,
      noOfInstallments: nInst,
      monthlyInterest: Math.round(monthlyInterest),
      totalInterest: Math.round(totalInterest),
      totalAmount: Math.round(totalAmount),
      installmentAmount: Math.round(finalInstallmentAmount),
      monthlyEmi: Math.round(finalInstallmentAmount),
      agreementDate: new Date(agreementDate),
      status: status || 'Active',
      createdBy: req.admin ? req.admin._id : null
    });

    return res.status(201).json({
      success: true,
      message: 'Customer loan record added successfully!',
      customer
    });
  } catch (error) {
    console.error('Add Customer Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to add customer. Please verify input fields.'
    });
  }
};

// @desc    Bulk Import Customers from Excel
// @route   POST /api/customers/bulk-import
// @access  Private (Admin only)
const bulkImportCustomers = async (req, res) => {
  try {
    const { customers } = req.body;

    if (!Array.isArray(customers) || customers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid customer data provided for bulk import.'
      });
    }

    const docsToInsert = [];

    for (const c of customers) {
      const loanNo = c.loanNo || c['Loan No'] || c['Loan Number'] || '';
      const name = c.name || c['Full Name'] || c['Customer Name'] || c['Name'] || '';
      const email = c.email || c['Email Address'] || c['Email'] || '';
      const phone = c.phone || c['Phone Number'] || c['Phone'] || c['Mobile'] || '';
      const vehicleNo = c.vehicleNo || c['Vehicle No'] || c['Vehicle Number'] || '';
      const vehicleModel = c.vehicleModel || c['Type of Model'] || c['Vehicle Model'] || c['Model'] || '';
      const modelYear = c.modelYear || c['Year of Model'] || c['Model Year'] || '2026';
      
      const vehicleInsurance = c.vehicleInsurance || c['Vehicle Insurance'] || '';
      const vehicleFitness = c.vehicleFitness || c['Fitness of Vehicle'] || c['Vehicle Fitness'] || '';
      const pucDetails = c.pucDetails || c['PUC'] || c['PUC Details'] || '';
      const roadTax = c.roadTax || c['Tax'] || c['Road Tax'] || '';

      const principal = Number(c.loanAmount || c['Loan Amount'] || 0);
      const rate = Number(c.interestRate || c['Rate of Interest'] || 1.5);
      const nInst = Number(c.noOfInstallments || c['No of Installments'] || c['No. of Installments'] || 1);
      const agreementDate = c.agreementDate || c['Date of Agreement'] || new Date();

      if (!loanNo || !name || !email || !phone || !vehicleNo || !vehicleModel || principal <= 0) {
        continue;
      }

      const monthlyInterest = (principal * rate) / 100;
      const totalInterest = monthlyInterest * nInst;
      const totalAmount = principal + totalInterest;
      const installmentAmount = nInst > 0 ? Math.round(totalAmount / nInst) : 0;

      docsToInsert.push({
        loanNo: String(loanNo).trim(),
        name: String(name).trim(),
        email: String(email).toLowerCase().trim(),
        phone: String(phone).trim(),
        vehicleNo: String(vehicleNo).trim(),
        vehicleModel: String(vehicleModel).trim(),
        modelYear: String(modelYear).trim(),
        vehicleInsurance: String(vehicleInsurance).trim(),
        vehicleFitness: String(vehicleFitness).trim(),
        pucDetails: String(pucDetails).trim(),
        roadTax: String(roadTax).trim(),
        loanAmount: principal,
        interestRate: rate,
        noOfInstallments: nInst,
        monthlyInterest: Math.round(monthlyInterest),
        totalInterest: Math.round(totalInterest),
        totalAmount: Math.round(totalAmount),
        installmentAmount: Math.round(installmentAmount),
        monthlyEmi: Math.round(installmentAmount),
        agreementDate: new Date(agreementDate),
        status: 'Active',
        createdBy: req.admin ? req.admin._id : null
      });
    }

    if (docsToInsert.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No valid customer rows found in Excel sheet. Please check required columns.'
      });
    }

    const inserted = await Customer.insertMany(docsToInsert, { ordered: false });

    return res.status(201).json({
      success: true,
      message: `${inserted.length} customer loan records imported successfully!`,
      count: inserted.length,
      customers: inserted
    });
  } catch (error) {
    console.error('Bulk Import Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to import bulk customers. Please verify Excel format.'
    });
  }
};

// @desc    Get All Customers
// @route   GET /api/customers
// @access  Private (Admin only)
const getCustomers = async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: customers.length,
      customers
    });
  } catch (error) {
    console.error('Get Customers Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve customers.'
    });
  }
};

// @desc    Delete Customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin only)
const deleteCustomer = async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: 'Customer not found.'
      });
    }

    await customer.deleteOne();

    return res.status(200).json({
      success: true,
      message: 'Customer deleted successfully.'
    });
  } catch (error) {
    console.error('Delete Customer Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to delete customer.'
    });
  }
};

module.exports = {
  addCustomer,
  bulkImportCustomers,
  getCustomers,
  deleteCustomer
};
