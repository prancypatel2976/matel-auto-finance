import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import * as XLSX from 'xlsx';
import {
  FiUserPlus,
  FiUsers,
  FiTrash2,
  FiPlus,
  FiX,
  FiCheckCircle,
  FiAlertCircle,
  FiDollarSign,
  FiTruck,
  FiMail,
  FiPhone,
  FiCalendar,
  FiSearch,
  FiFileText,
  FiHash,
  FiPercent,
  FiShield,
  FiCheckSquare,
  FiCreditCard,
  FiClock,
  FiTrendingUp,
  FiCheck,
  FiList,
  FiUpload,
  FiDownload,
  FiFile
} from 'react-icons/fi';

const AdminDashboard = () => {
  const { admin } = useAuth();
  const navigate = useNavigate();

  const [customers, setCustomers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Search and Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [alert, setAlert] = useState({ type: '', message: '' });

  // Add Customer Form State
  const [formData, setFormData] = useState({
    loanNo: '',
    name: '',
    email: '',
    phone: '',
    vehicleNo: '',
    vehicleModel: '',
    modelYear: '',
    vehicleInsurance: '',
    vehicleFitness: '',
    pucDetails: '',
    roadTax: '',
    loanAmount: '',
    installmentAmount: '',
    noOfInstallments: '',
    interestRate: '1.5',
    agreementDate: new Date().toISOString().split('T')[0],
    status: 'Active'
  });

  const [formErrors, setFormErrors] = useState({});

  // Pay Installment Modal State
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [payData, setPayData] = useState({
    paymentAmount: '',
    paymentDate: new Date().toISOString().split('T')[0],
    lateFee: '',
    remarks: ''
  });
  const [payErrors, setPayErrors] = useState({});
  const [submittingPay, setSubmittingPay] = useState(false);

  // Payment History Modal State
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [historyCustomer, setHistoryCustomer] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Bulk Excel Import State
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [excelParsedData, setExcelParsedData] = useState([]);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [bulkError, setBulkError] = useState('');

  // 1. Download Sample Excel Template (Headers Only)
  const handleDownloadSampleExcel = () => {
    const headers = [
      [
        'Loan No',
        'Full Name',
        'Email Address',
        'Phone Number',
        'Vehicle No',
        'Type of Model',
        'Year of Model',
        'Loan Amount',
        'Rate of Interest',
        'No of Installments',
        'Date of Agreement',
        'Vehicle Insurance',
        'Fitness of Vehicle',
        'PUC',
        'Tax'
      ]
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(headers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Customer_Loan_Template');

    worksheet['!cols'] = [
      { wch: 16 }, { wch: 22 }, { wch: 26 }, { wch: 18 }, { wch: 16 },
      { wch: 22 }, { wch: 15 }, { wch: 15 }, { wch: 16 }, { wch: 18 },
      { wch: 18 }, { wch: 24 }, { wch: 24 }, { wch: 22 }, { wch: 18 }
    ];

    XLSX.writeFile(workbook, 'Matel_Auto_Finance_Sample_Template.xlsx');
  };

  // 2. Parse Uploaded Excel File
  const handleExcelFileUpload = (e) => {
    setBulkError('');
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFileName(file.name);

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);

        if (!data || data.length === 0) {
          setBulkError('Uploaded Excel file is empty or invalid.');
          setExcelParsedData([]);
          return;
        }

        setExcelParsedData(data);
      } catch (err) {
        console.error('Parse Excel Error:', err);
        setBulkError('Failed to read Excel file. Please upload a valid .xlsx or .xls file.');
        setExcelParsedData([]);
      }
    };
    reader.readAsBinaryString(file);
  };

  // 3. Submit Bulk Import to Backend
  const handleConfirmBulkImport = async () => {
    if (excelParsedData.length === 0) {
      setBulkError('Please upload a valid Excel file first.');
      return;
    }

    setUploadingBulk(true);
    setBulkError('');

    try {
      const res = await api.post('/customers/bulk-import', { customers: excelParsedData });
      if (res.data.success) {
        setShowBulkModal(false);
        setExcelParsedData([]);
        setSelectedFileName('');
        fetchCustomers();
      }
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'Failed to import bulk customers. Please verify Excel format.';
      setBulkError(msg);
    } finally {
      setUploadingBulk(false);
    }
  };

  // Prevent browser back button navigation out of Dashboard while authenticated
  useEffect(() => {
    window.history.pushState(null, '', window.location.href);

    const handlePopState = () => {
      window.history.pushState(null, '', window.location.href);
    };

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  // Prevent mouse wheel scrolling from changing number input values
  useEffect(() => {
    const handleWheel = (e) => {
      if (document.activeElement && document.activeElement.type === 'number') {
        document.activeElement.blur();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });

    return () => {
      window.removeEventListener('wheel', handleWheel);
    };
  }, []);

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/customers');
      if (res.data.success) {
        setCustomers(res.data.customers || []);
      }
    } catch (err) {
      console.error('Fetch Customers Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    let { name, value } = e.target;

    // Disallow negative values (enforce 0 to infinity)
    if (['noOfInstallments', 'loanAmount', 'installmentAmount', 'interestRate'].includes(name)) {
      if (value !== '' && Number(value) < 0) {
        value = '0';
      }
    }

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };

      // Auto calculate Installment Amount based on formula:
      // Monthly Interest = Loan Amount * Rate%
      // Total Interest = Monthly Interest * No of Installments
      // Total Amount = Loan Amount + Total Interest
      // Amount of Installment = Total Amount / No of Installments
      if (['loanAmount', 'interestRate', 'noOfInstallments'].includes(name)) {
        const principal = Number(updated.loanAmount) || 0;
        const rate = Number(updated.interestRate) || 0;
        const nInst = Number(updated.noOfInstallments) || 0;

        if (principal > 0 && nInst > 0) {
          const monthlyInt = (principal * rate) / 100;
          const totInt = monthlyInt * nInst;
          const totAmt = principal + totInt;
          const calcEmi = Math.round(totAmt / nInst);
          updated.installmentAmount = String(calcEmi);
        }
      }

      return updated;
    });

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.loanNo.trim()) errors.loanNo = 'Loan Number is required.';
    if (!formData.name.trim()) errors.name = 'Customer name is required.';
    if (!formData.email.trim()) errors.email = 'Email address is required.';
    if (!formData.phone.trim()) errors.phone = 'Phone number is required.';
    if (!formData.vehicleNo.trim()) errors.vehicleNo = 'Vehicle Number is required.';
    if (!formData.vehicleModel.trim()) errors.vehicleModel = 'Type of model is required.';
    if (!formData.modelYear.trim()) errors.modelYear = 'Year of model is required.';
    if (!formData.loanAmount || Number(formData.loanAmount) <= 0) errors.loanAmount = 'Valid loan amount is required.';
    if (!formData.installmentAmount || Number(formData.installmentAmount) <= 0) errors.installmentAmount = 'Valid amount of installment is required.';
    if (!formData.noOfInstallments || Number(formData.noOfInstallments) <= 0) errors.noOfInstallments = 'Number of installments is required.';
    if (formData.interestRate === '' || Number(formData.interestRate) < 0) errors.interestRate = 'Valid rate of interest is required.';
    if (!formData.agreementDate) errors.agreementDate = 'Date of agreement is required.';

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddCustomer = async (e) => {
    e.preventDefault();
    setAlert({ type: '', message: '' });

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const res = await api.post('/customers', formData);
      if (res.data.success) {
        setShowModal(false);
        // Reset form to defaults
        setFormData({
          loanNo: '',
          name: '',
          email: '',
          phone: '',
          vehicleNo: '',
          vehicleModel: '',
          modelYear: '2026',
          vehicleInsurance: '',
          vehicleFitness: '',
          pucDetails: '',
          roadTax: '',
          loanAmount: '',
          installmentAmount: '',
          noOfInstallments: '',
          interestRate: '1.5',
          agreementDate: new Date().toISOString().split('T')[0],
          status: 'Active'
        });
        fetchCustomers();
      }
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'Failed to add customer loan record. Please try again.';
      setAlert({ type: 'danger', message: msg });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete customer loan record for "${name}"?`)) return;

    try {
      const res = await api.delete(`/customers/${id}`);
      if (res.data.success) {
        setCustomers((prev) => prev.filter((c) => c._id !== id));
      }
    } catch (err) {
      console.error('Failed to delete customer:', err);
    }
  };

  // Open Pay Installment Modal
  const handleOpenPayModal = (customer) => {
    setSelectedCustomer(customer);
    setPayData({
      paymentAmount: customer.installmentAmount || customer.monthlyEmi || '',
      paymentDate: new Date().toISOString().split('T')[0],
      lateFee: '0',
      remarks: `Installment #${(customer.paidInstallmentsCount || 0) + 1}`
    });
    setPayErrors({});
    setShowPayModal(true);
  };

  const handlePayInputChange = (e) => {
    let { name, value } = e.target;
    if (['paymentAmount', 'lateFee'].includes(name)) {
      if (value !== '' && Number(value) < 0) {
        value = '0';
      }
    }
    setPayData((prev) => ({ ...prev, [name]: value }));
    if (payErrors[name]) {
      setPayErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmitPayment = async (e) => {
    e.preventDefault();
    if (!selectedCustomer) return;

    const errors = {};
    if (!payData.paymentAmount || Number(payData.paymentAmount) <= 0) {
      errors.paymentAmount = 'Valid payment amount is required.';
    }
    if (!payData.paymentDate) {
      errors.paymentDate = 'Payment date is required.';
    }

    if (Object.keys(errors).length > 0) {
      setPayErrors(errors);
      return;
    }

    setSubmittingPay(true);
    try {
      const payload = {
        customerId: selectedCustomer._id,
        paymentAmount: Number(payData.paymentAmount),
        paymentDate: payData.paymentDate,
        lateFee: Number(payData.lateFee || 0),
        remarks: payData.remarks
      };

      const res = await api.post('/payments', payload);
      if (res.data.success) {
        setShowPayModal(false);
        fetchCustomers();
      }
    } catch (err) {
      const msg = err.response && err.response.data && err.response.data.message
        ? err.response.data.message
        : 'Failed to record installment payment.';
      setAlert({ type: 'danger', message: msg });
    } finally {
      setSubmittingPay(false);
    }
  };

  // Open Payment History Modal
  const handleOpenHistoryModal = async (customer) => {
    setHistoryCustomer(customer);
    setShowHistoryModal(true);
    setLoadingHistory(true);
    try {
      const res = await api.get(`/payments/customer/${customer._id}`);
      if (res.data.success) {
        setPaymentHistory(res.data.payments || []);
      }
    } catch (err) {
      console.error('Fetch Payment History Error:', err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Helper to compute Total Payable Loan Amount (Principal + Total Interest)
  const getTotalPayableAmount = (c) => {
    if (!c) return 0;
    if (c.totalAmount && c.totalAmount > 0) return c.totalAmount;
    if (c.installmentAmount && c.noOfInstallments) return c.installmentAmount * c.noOfInstallments;
    return c.loanAmount || 0;
  };

  // Search Filter
  const filteredCustomers = customers.filter((c) =>
    (c.loanNo && c.loanNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.name && c.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.vehicleNo && c.vehicleNo.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (c.modelYear && c.modelYear.includes(searchTerm)) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  // Live Loan Calculation variables for Add Customer Modal
  const principal = Number(formData.loanAmount) || 0;
  const rate = Number(formData.interestRate) || 0;
  const nInst = Number(formData.noOfInstallments) || 0;
  const calcMonthlyInterest = (principal * rate) / 100;
  const calcTotalInterest = calcMonthlyInterest * nInst;
  const calcTotalAmount = principal + calcTotalInterest;
  const calcInstallmentAmount = nInst > 0 ? Math.round(calcTotalAmount / nInst) : 0;

  return (
    <div className="dashboard-container">
      {/* Top Banner Header */}
      <div className="dashboard-header-card">
        <div className="dashboard-header-text">
          <h1 className="dashboard-title">Welcome to Matel Auto Finance</h1>
          <h2 className="dashboard-welcome">Welcome, {admin?.name || 'Admin'}</h2>
        </div>

        <div className="header-action-group">
          <button
            onClick={() => {
              setShowBulkModal(true);
              setBulkError('');
              setExcelParsedData([]);
              setSelectedFileName('');
            }}
            className="btn btn-outline-primary bulk-upload-btn"
          >
            <FiUpload className="btn-icon" /> Bulk Excel Upload
          </button>

          <button
            onClick={() => {
              setShowModal(true);
              setAlert({ type: '', message: '' });
            }}
            className="btn btn-primary add-customer-header-btn"
          >
            <FiPlus className="btn-icon" /> Add Customer
          </button>
        </div>
      </div>

      {/* Alert Banners */}
      {alert.message && (
        <div className={`alert ${alert.type === 'success' ? 'alert-success' : 'alert-danger'}`}>
          {alert.type === 'success' ? <FiCheckCircle className="alert-icon" /> : <FiAlertCircle className="alert-icon" />}
          <span>{alert.message}</span>
        </div>
      )}

      {/* Customer List Section */}
      <div className="customer-section-card">
        <div className="customer-section-header">
          <div className="customer-header-title">
            <FiUsers className="section-icon" />
            <h2>Customer & Vehicle Loan Records</h2>
            <span className="customer-count-badge">{customers.length} Customers</span>
          </div>

          <div className="customer-search-wrapper">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search Loan No, Name, Vehicle No, Phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="customer-search-input"
            />
          </div>
        </div>

        {/* Table or Loading State */}
        {loading ? (
          <div className="table-loading-box">
            <div className="spinner"></div>
            <p>Loading customer records...</p>
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="empty-customer-box">
            <FiUserPlus className="empty-icon" />
            <h3>No Customer Records Found</h3>
            <p>Click the "Add Customer" button above to add your first auto loan record.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="customer-table">
              <thead>
                <tr>
                  <th>Loan No</th>
                  <th>Customer Details</th>
                  <th>Vehicle & Year</th>
                  <th>Total Loan (₹)</th>
                  <th>Installment (₹)</th>
                  <th>Paid / Remaining (₹)</th>
                  <th>Agreement Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => {
                  const paid = customer.totalPaid || 0;
                  const totalPayable = getTotalPayableAmount(customer);
                  const remaining = Math.max(0, totalPayable - paid);
                  const instCount = customer.noOfInstallments || 0;
                  const paidCount = customer.paidInstallmentsCount || 0;
                  const isFullyPaid = (totalPayable > 0 && paid >= totalPayable) || (instCount > 0 && paidCount >= instCount);

                  return (
                    <tr key={customer._id}>
                      {/* Loan No */}
                      <td className="loan-no-cell">
                        <span className="loan-badge">
                          <FiHash /> {customer.loanNo || 'N/A'}
                        </span>
                      </td>

                      {/* Customer Details */}
                      <td className="customer-name-cell">
                        <strong>{customer.name}</strong>
                        <div className="contact-cell">
                          <span><FiMail /> {customer.email}</span>
                          <span><FiPhone /> {customer.phone}</span>
                        </div>
                      </td>

                      {/* Vehicle & Year */}
                      <td>
                        <div className="vehicle-cell">
                          <strong><FiTruck /> {customer.vehicleNo || 'N/A'}</strong>
                          <span className="sub-vehicle">{customer.vehicleModel} ({customer.modelYear || '2026'})</span>
                          {(customer.vehicleInsurance || customer.vehicleFitness || customer.pucDetails || customer.roadTax) && (
                            <div className="compliance-pills">
                              {customer.vehicleInsurance && <span className="comp-pill" title={customer.vehicleInsurance}>Ins: {String(customer.vehicleInsurance).replace(/Valid Upto /i, '').replace(/Paid Upto /i, '')}</span>}
                              {customer.vehicleFitness && <span className="comp-pill" title={customer.vehicleFitness}>Fit: {String(customer.vehicleFitness).replace(/Valid Upto /i, '').replace(/Paid Upto /i, '')}</span>}
                              {customer.pucDetails && <span className="comp-pill" title={customer.pucDetails}>PUC: {String(customer.pucDetails).replace(/Valid Upto /i, '').replace(/Paid Upto /i, '')}</span>}
                              {customer.roadTax && <span className="comp-pill" title={customer.roadTax}>Tax: {String(customer.roadTax).replace(/Valid Upto /i, '').replace(/Paid Upto /i, '')}</span>}
                            </div>
                          )}
                        </div>
                      </td>

                      {/* Total Loan */}
                      <td className="amount-cell">
                        <strong>₹{Number(totalPayable).toLocaleString()}</strong>
                        <div className="sub-rate">Princ: ₹{Number(customer.loanAmount || 0).toLocaleString()} + Int ({customer.interestRate ?? 1.5}%)</div>
                      </td>

                      {/* Installment Amount */}
                      <td className="emi-cell">
                        ₹{Number(customer.installmentAmount || customer.monthlyEmi || 0).toLocaleString()}/inst
                        <div className="sub-count">{paidCount} / {instCount || 36} Inst</div>
                      </td>

                      {/* Paid & Remaining Balance */}
                      <td>
                        <div className="payment-progress-box">
                          <span className="paid-text">Paid: ₹{Number(paid).toLocaleString()}</span>
                          <span className="remaining-text">Rem: ₹{Number(remaining).toLocaleString()}</span>
                        </div>
                      </td>

                      {/* Agreement Date */}
                      <td className="date-cell">
                        <FiCalendar /> {customer.agreementDate ? new Date(customer.agreementDate).toLocaleDateString() : 'N/A'}
                      </td>

                      {/* Status */}
                      <td>
                        <span className={`status-tag status-${isFullyPaid ? 'approved' : (customer.status ? customer.status.toLowerCase() : 'active')}`}>
                          {isFullyPaid ? 'Completed' : (customer.status || 'Active')}
                        </span>
                      </td>

                      {/* Actions */}
                      <td>
                        <div className="action-buttons-group">
                          {isFullyPaid ? (
                            <button
                              disabled
                              className="btn-action-pay btn-action-completed"
                              title="Installment Complete"
                            >
                              <FiCheckCircle /> Completed
                            </button>
                          ) : (
                            <button
                              onClick={() => handleOpenPayModal(customer)}
                              className="btn-action-pay"
                              title="Pay Installment"
                            >
                              <FiCreditCard /> Pay
                            </button>
                          )}
                          <button
                            onClick={() => handleOpenHistoryModal(customer)}
                            className="btn-action-history"
                            title="Payment History"
                          >
                            <FiList /> History
                          </button>
                          <button
                            onClick={() => handleDeleteCustomer(customer._id, customer.name)}
                            className="btn-icon-danger"
                            title="Delete Record"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 1. Add Customer Modal Overlay */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>
                <FiUserPlus className="modal-header-icon" /> Add New Customer Loan Record
              </h3>
              <button onClick={() => setShowModal(false)} className="modal-close-btn">
                <FiX />
              </button>
            </div>

            <form onSubmit={handleAddCustomer} className="modal-form" noValidate>
              {/* Primary Loan & Vehicle Info */}
              <div className="form-grid">
                {/* 1. Loan No */}
                <div className="form-group">
                  <label htmlFor="loanNo" className="form-label">Loan No *</label>
                  <input
                    type="text"
                    id="loanNo"
                    name="loanNo"
                    value={formData.loanNo}
                    onChange={handleInputChange}
                    placeholder="e.g. LN-2026-001"
                    className={`form-input ${formErrors.loanNo ? 'input-error' : ''}`}
                  />
                  {formErrors.loanNo && <span className="error-message">{formErrors.loanNo}</span>}
                </div>

                {/* 2. Full Name */}
                <div className="form-group">
                  <label htmlFor="name" className="form-label">Full Name *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="e.g. Rahul Patel"
                    className={`form-input ${formErrors.name ? 'input-error' : ''}`}
                  />
                  {formErrors.name && <span className="error-message">{formErrors.name}</span>}
                </div>

                {/* 3. Email Address */}
                <div className="form-group">
                  <label htmlFor="email" className="form-label">Email Address *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="e.g. rahul@example.com"
                    className={`form-input ${formErrors.email ? 'input-error' : ''}`}
                  />
                  {formErrors.email && <span className="error-message">{formErrors.email}</span>}
                </div>

                {/* 4. Phone Number */}
                <div className="form-group">
                  <label htmlFor="phone" className="form-label">Phone Number *</label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. +91 98765 43210"
                    className={`form-input ${formErrors.phone ? 'input-error' : ''}`}
                  />
                  {formErrors.phone && <span className="error-message">{formErrors.phone}</span>}
                </div>

                {/* 5. Vehicle No */}
                <div className="form-group">
                  <label htmlFor="vehicleNo" className="form-label">Vehicle No *</label>
                  <input
                    type="text"
                    id="vehicleNo"
                    name="vehicleNo"
                    value={formData.vehicleNo}
                    onChange={handleInputChange}
                    placeholder="e.g. GJ-01-AB-1234"
                    className={`form-input ${formErrors.vehicleNo ? 'input-error' : ''}`}
                  />
                  {formErrors.vehicleNo && <span className="error-message">{formErrors.vehicleNo}</span>}
                </div>

                {/* 6. Type of Model / Vehicle Model */}
                <div className="form-group">
                  <label htmlFor="vehicleModel" className="form-label">Type of Model / Vehicle Model *</label>
                  <input
                    type="text"
                    id="vehicleModel"
                    name="vehicleModel"
                    value={formData.vehicleModel}
                    onChange={handleInputChange}
                    placeholder="e.g. Honda City (Sedan)"
                    className={`form-input ${formErrors.vehicleModel ? 'input-error' : ''}`}
                  />
                  {formErrors.vehicleModel && <span className="error-message">{formErrors.vehicleModel}</span>}
                </div>

                {/* 7. Year of Model */}
                <div className="form-group">
                  <label htmlFor="modelYear" className="form-label">Year of Model *</label>
                  <input
                    type="text"
                    id="modelYear"
                    name="modelYear"
                    value={formData.modelYear}
                    onChange={handleInputChange}
                    placeholder="e.g. 2026"
                    className={`form-input ${formErrors.modelYear ? 'input-error' : ''}`}
                  />
                  {formErrors.modelYear && <span className="error-message">{formErrors.modelYear}</span>}
                </div>

                {/* 8. Loan Amount */}
                <div className="form-group">
                  <label htmlFor="loanAmount" className="form-label">Loan Amount (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    id="loanAmount"
                    name="loanAmount"
                    value={formData.loanAmount}
                    onChange={handleInputChange}
                    onWheel={(e) => e.target.blur()}
                    placeholder="e.g. 250000"
                    className={`form-input ${formErrors.loanAmount ? 'input-error' : ''}`}
                  />
                  {formErrors.loanAmount && <span className="error-message">{formErrors.loanAmount}</span>}
                </div>

                {/* 9. Amount of Installment */}
                <div className="form-group">
                  <label htmlFor="installmentAmount" className="form-label">Amount of Installment (₹) *</label>
                  <input
                    type="number"
                    min="0"
                    id="installmentAmount"
                    name="installmentAmount"
                    value={formData.installmentAmount}
                    onChange={handleInputChange}
                    onWheel={(e) => e.target.blur()}
                    placeholder="e.g. 7500"
                    className={`form-input ${formErrors.installmentAmount ? 'input-error' : ''}`}
                  />
                  {formErrors.installmentAmount && <span className="error-message">{formErrors.installmentAmount}</span>}
                </div>

                {/* 10. No of Installments */}
                <div className="form-group">
                  <label htmlFor="noOfInstallments" className="form-label">No. of Installments *</label>
                  <input
                    type="number"
                    min="0"
                    id="noOfInstallments"
                    name="noOfInstallments"
                    value={formData.noOfInstallments}
                    onChange={handleInputChange}
                    onWheel={(e) => e.target.blur()}
                    placeholder="e.g. 36"
                    className={`form-input ${formErrors.noOfInstallments ? 'input-error' : ''}`}
                  />
                  {formErrors.noOfInstallments && <span className="error-message">{formErrors.noOfInstallments}</span>}
                </div>

                {/* 11. Rate of Interest (%) - Default 1.5 */}
                <div className="form-group">
                  <label htmlFor="interestRate" className="form-label">Rate of Interest (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    id="interestRate"
                    name="interestRate"
                    value={formData.interestRate}
                    onChange={handleInputChange}
                    onWheel={(e) => e.target.blur()}
                    placeholder="1.5"
                    className={`form-input ${formErrors.interestRate ? 'input-error' : ''}`}
                  />
                  {formErrors.interestRate && <span className="error-message">{formErrors.interestRate}</span>}
                </div>

                {/* 12. Date of Agreement */}
                <div className="form-group">
                  <label htmlFor="agreementDate" className="form-label">Date of Agreement *</label>
                  <input
                    type="date"
                    id="agreementDate"
                    name="agreementDate"
                    value={formData.agreementDate}
                    onChange={handleInputChange}
                    className={`form-input ${formErrors.agreementDate ? 'input-error' : ''}`}
                  />
                  {formErrors.agreementDate && <span className="error-message">{formErrors.agreementDate}</span>}
                </div>

                {/* 13. Loan Status */}
                <div className="form-group">
                  <label htmlFor="status" className="form-label">Loan Status</label>
                  <select
                    id="status"
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                    className="form-input"
                  >
                    <option value="Active">Active</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Live Sum Format Loan Calculation Box */}
              {principal > 0 && (
                <div className="loan-calculation-box">
                  <div className="calc-box-header">
                    <FiTrendingUp className="calc-header-icon" />
                    <strong>Live Loan Calculation Breakdown (Sum Format)</strong>
                  </div>
                  <div className="calc-grid-layout">
                    <div className="calc-card">
                      <span className="calc-card-title">1. Monthly Interest</span>
                      <span className="calc-card-formula">₹{principal.toLocaleString()} × {rate}%</span>
                      <strong className="calc-card-result">₹{Math.round(calcMonthlyInterest).toLocaleString()} / mo</strong>
                    </div>
                    <div className="calc-card">
                      <span className="calc-card-title">2. Total Interest</span>
                      <span className="calc-card-formula">₹{Math.round(calcMonthlyInterest).toLocaleString()} × {nInst} Inst</span>
                      <strong className="calc-card-result text-primary">₹{Math.round(calcTotalInterest).toLocaleString()}</strong>
                    </div>
                    <div className="calc-card">
                      <span className="calc-card-title">3. Total Amount</span>
                      <span className="calc-card-formula">₹{principal.toLocaleString()} + ₹{Math.round(calcTotalInterest).toLocaleString()}</span>
                      <strong className="calc-card-result text-dark">₹{Math.round(calcTotalAmount).toLocaleString()}</strong>
                    </div>
                    <div className="calc-card calc-card-accent">
                      <span className="calc-card-title">4. Amount of Installment</span>
                      <span className="calc-card-formula">₹{Math.round(calcTotalAmount).toLocaleString()} / {nInst} Inst</span>
                      <strong className="calc-card-result text-success">₹{Math.round(calcInstallmentAmount).toLocaleString()} / inst</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Vehicle Documents & Compliance Section */}
              <div className="form-section-divider">
                <FiCheckSquare className="divider-icon" />
                <span>Vehicle Documents & Compliance</span>
              </div>

              <div className="form-grid">
                {/* Vehicle Insurance */}
                <div className="form-group">
                  <label htmlFor="vehicleInsurance" className="form-label">Vehicle Insurance</label>
                  <input
                    type="text"
                    id="vehicleInsurance"
                    name="vehicleInsurance"
                    value={formData.vehicleInsurance}
                    onChange={handleInputChange}
                    placeholder="e.g. Valid Upto 2027-12-31 or Policy No"
                    className="form-input"
                  />
                </div>

                {/* Fitness of Vehicle */}
                <div className="form-group">
                  <label htmlFor="vehicleFitness" className="form-label">Fitness of Vehicle</label>
                  <input
                    type="text"
                    id="vehicleFitness"
                    name="vehicleFitness"
                    value={formData.vehicleFitness}
                    onChange={handleInputChange}
                    placeholder="e.g. Valid Upto 2030-05-15"
                    className="form-input"
                  />
                </div>

                {/* PUC */}
                <div className="form-group">
                  <label htmlFor="pucDetails" className="form-label">PUC</label>
                  <input
                    type="text"
                    id="pucDetails"
                    name="pucDetails"
                    value={formData.pucDetails}
                    onChange={handleInputChange}
                    placeholder="e.g. Valid Upto 2027-06-30"
                    className="form-input"
                  />
                </div>

                {/* Tax */}
                <div className="form-group">
                  <label htmlFor="roadTax" className="form-label">Tax</label>
                  <input
                    type="text"
                    id="roadTax"
                    name="roadTax"
                    value={formData.roadTax}
                    onChange={handleInputChange}
                    placeholder="e.g. Paid Upto 2028-03-31"
                    className="form-input"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="btn btn-outline-danger"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={submitting}
                >
                  {submitting ? (
                    <>
                      <span className="btn-spinner"></span> Saving Record...
                    </>
                  ) : (
                    <>
                      <FiUserPlus /> Save Customer Record
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Pay Installment Modal */}
      {showPayModal && selectedCustomer && (() => {
        const selectedTotalLoan = getTotalPayableAmount(selectedCustomer);
        const isSelectedCustomerCompleted = (
          (selectedTotalLoan > 0 && (selectedCustomer.totalPaid || 0) >= selectedTotalLoan) ||
          (selectedCustomer.noOfInstallments > 0 && (selectedCustomer.paidInstallmentsCount || 0) >= selectedCustomer.noOfInstallments)
        );

        return (
          <div className="modal-overlay">
            <div className="modal-card modal-card-sm">
              <div className="modal-header">
                <h3>
                  <FiCreditCard className="modal-header-icon" /> Record Installment Payment
                </h3>
                <button onClick={() => setShowPayModal(false)} className="modal-close-btn">
                  <FiX />
                </button>
              </div>

              <form onSubmit={handleSubmitPayment} className="modal-form" noValidate>
                {/* Completed Notice Banner */}
                {isSelectedCustomerCompleted && (
                  <div className="alert alert-success">
                    <FiCheckCircle className="alert-icon" />
                    <span><strong>Installment Complete!</strong> All installments for this customer loan have been paid in full.</span>
                  </div>
                )}

                {/* Customer Summary Box */}
                <div className="pay-summary-box">
                  <div className="pay-summary-header">
                    <strong>{selectedCustomer.name}</strong>
                    <span className="loan-badge"><FiHash /> {selectedCustomer.loanNo}</span>
                  </div>
                  <div className="pay-summary-grid">
                    <div>
                      <span className="summary-label">Principal Loan</span>
                      <span className="summary-value">₹{Number(selectedCustomer.loanAmount || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="summary-label">Total Interest</span>
                      <span className="summary-value text-warning">+₹{Number(selectedCustomer.totalInterest || Math.round((selectedCustomer.loanAmount * (selectedCustomer.interestRate || 1.5) / 100) * (selectedCustomer.noOfInstallments || 20))).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="summary-label">Total Payable</span>
                      <span className="summary-value">₹{Number(selectedTotalLoan).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="summary-label">Total Paid</span>
                      <span className="summary-value text-success">₹{Number(selectedCustomer.totalPaid || 0).toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="summary-label">Remaining Balance</span>
                      <span className="summary-value text-primary">₹{Number(Math.max(0, selectedTotalLoan - (selectedCustomer.totalPaid || 0))).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="form-grid">
                  {/* Payment Amount */}
                  <div className="form-group">
                    <label htmlFor="paymentAmount" className="form-label">Payment Amount (₹) *</label>
                    <input
                      type="number"
                      min="0"
                      id="paymentAmount"
                      name="paymentAmount"
                      value={payData.paymentAmount}
                      onChange={handlePayInputChange}
                      onWheel={(e) => e.target.blur()}
                      placeholder="e.g. 7500"
                      disabled={isSelectedCustomerCompleted}
                      className={`form-input ${payErrors.paymentAmount ? 'input-error' : ''}`}
                    />
                    {payErrors.paymentAmount && <span className="error-message">{payErrors.paymentAmount}</span>}
                  </div>

                  {/* Payment Date */}
                  <div className="form-group">
                    <label htmlFor="paymentDate" className="form-label">Payment Date *</label>
                    <input
                      type="date"
                      id="paymentDate"
                      name="paymentDate"
                      value={payData.paymentDate}
                      onChange={handlePayInputChange}
                      disabled={isSelectedCustomerCompleted}
                      className={`form-input ${payErrors.paymentDate ? 'input-error' : ''}`}
                    />
                    {payErrors.paymentDate && <span className="error-message">{payErrors.paymentDate}</span>}
                  </div>

                  {/* Late Installment Penalty */}
                  <div className="form-group">
                    <label htmlFor="lateFee" className="form-label">Late Installment Charges (₹)</label>
                    <input
                      type="number"
                      min="0"
                      id="lateFee"
                      name="lateFee"
                      value={payData.lateFee}
                      onChange={handlePayInputChange}
                      onWheel={(e) => e.target.blur()}
                      disabled={isSelectedCustomerCompleted}
                      placeholder="0"
                      className="form-input"
                    />
                  </div>

                  {/* Remarks */}
                  <div className="form-group">
                    <label htmlFor="remarks" className="form-label">Remarks / Note</label>
                    <input
                      type="text"
                      id="remarks"
                      name="remarks"
                      value={payData.remarks}
                      onChange={handlePayInputChange}
                      disabled={isSelectedCustomerCompleted}
                      placeholder="e.g. Installment #3 Paid via UPI/Cash"
                      className="form-input"
                    />
                  </div>
                </div>

                {/* Realtime Post-Payment Calculation Preview */}
                <div className="post-payment-preview">
                  <div>
                    <span>Updated Paid Total:</span>
                    <strong>₹{Number((selectedCustomer.totalPaid || 0) + Number(payData.paymentAmount || 0)).toLocaleString()}</strong>
                  </div>
                  <div>
                    <span>Updated Remaining:</span>
                    <strong className="text-primary">
                      ₹{Number(Math.max(0, selectedTotalLoan - ((selectedCustomer.totalPaid || 0) + Number(payData.paymentAmount || 0)))).toLocaleString()}
                    </strong>
                  </div>
                </div>

                <div className="modal-actions">
                  <button
                    type="button"
                    onClick={() => setShowPayModal(false)}
                    className="btn btn-outline-danger"
                    disabled={submittingPay}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={submittingPay || isSelectedCustomerCompleted}
                  >
                    {isSelectedCustomerCompleted ? (
                      <>
                        <FiCheckCircle /> Installment Complete
                      </>
                    ) : submittingPay ? (
                      <>
                        <span className="btn-spinner"></span> Saving Payment...
                      </>
                    ) : (
                      <>
                        <FiCheck /> Confirm Payment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        );
      })()}

      {/* 3. Payment History Ledger Modal */}
      {showHistoryModal && historyCustomer && (() => {
        const historyTotalLoan = getTotalPayableAmount(historyCustomer);
        return (
          <div className="modal-overlay">
            <div className="modal-card">
              <div className="modal-header">
                <h3>
                  <FiList className="modal-header-icon" /> Payment Ledger: {historyCustomer.name}
                </h3>
                <button onClick={() => setShowHistoryModal(false)} className="modal-close-btn">
                  <FiX />
                </button>
              </div>

              <div className="modal-form">
                {/* Summary Banner */}
                <div className="history-summary-banner">
                  <div className="history-summary-item">
                    <span className="history-label">Loan No</span>
                    <span className="history-val"><FiHash /> {historyCustomer.loanNo}</span>
                  </div>
                  <div className="history-summary-item">
                    <span className="history-label">Principal Loan</span>
                    <span className="history-val">₹{Number(historyCustomer.loanAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="history-summary-item">
                    <span className="history-label">Total Interest</span>
                    <span className="history-val text-warning">+₹{Number(historyCustomer.totalInterest || Math.round((historyCustomer.loanAmount * (historyCustomer.interestRate || 1.5) / 100) * (historyCustomer.noOfInstallments || 20))).toLocaleString()}</span>
                  </div>
                  <div className="history-summary-item">
                    <span className="history-label">Total Payable</span>
                    <span className="history-val">₹{Number(historyTotalLoan).toLocaleString()}</span>
                  </div>
                  <div className="history-summary-item">
                    <span className="history-label">Paid Amount</span>
                    <span className="history-val text-success">₹{Number(historyCustomer.totalPaid || 0).toLocaleString()}</span>
                  </div>
                  <div className="history-summary-item">
                    <span className="history-label">Remaining Loan</span>
                    <span className="history-val text-primary">₹{Number(Math.max(0, historyTotalLoan - (historyCustomer.totalPaid || 0))).toLocaleString()}</span>
                  </div>
                </div>

              {/* History Table */}
              {loadingHistory ? (
                <div className="table-loading-box">
                  <div className="spinner"></div>
                  <p>Loading payment ledger...</p>
                </div>
              ) : paymentHistory.length === 0 ? (
                <div className="empty-customer-box">
                  <FiClock className="empty-icon" />
                  <h4>No Payment Records Yet</h4>
                  <p>No installment payments have been recorded for this customer yet.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="customer-table history-table">
                    <thead>
                      <tr>
                        <th>Payment Date</th>
                        <th>Payment Amount (₹)</th>
                        <th>Late Fee (₹)</th>
                        <th>Paid Total (₹)</th>
                        <th>Remaining (₹)</th>
                        <th>Remarks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {paymentHistory.map((p) => (
                        <tr key={p._id}>
                          <td className="date-cell">
                            <FiCalendar /> {new Date(p.paymentDate).toLocaleDateString()}
                          </td>
                          <td className="amount-cell text-success">
                            +₹{Number(p.paymentAmount).toLocaleString()}
                          </td>
                          <td className="late-fee-cell">
                            {p.lateFee > 0 ? `₹${Number(p.lateFee).toLocaleString()}` : '-'}
                          </td>
                          <td className="paid-total-cell">
                            ₹{Number(p.paidAmountAfterPayment).toLocaleString()}
                          </td>
                          <td className="remaining-cell">
                            ₹{Number(p.remainingAmountAfterPayment).toLocaleString()}
                          </td>
                          <td className="remarks-cell">
                            {p.remarks || 'Installment'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
        );
      })()}

      {/* 4. Bulk Excel Customer Import Modal */}
      {showBulkModal && (
        <div className="modal-overlay">
          <div className="modal-card modal-card-md">
            <div className="modal-header">
              <h3>
                <FiUpload className="modal-header-icon" /> Bulk Customer Excel Import
              </h3>
              <button onClick={() => setShowBulkModal(false)} className="modal-close-btn">
                <FiX />
              </button>
            </div>

            <div className="modal-form">
              {/* Error Banner */}
              {bulkError && (
                <div className="alert alert-danger">
                  <FiAlertCircle className="alert-icon" />
                  <span>{bulkError}</span>
                </div>
              )}

              {/* Step 1: Download Sample Excel Template */}
              <div className="bulk-step-card">
                <div className="bulk-step-header">
                  <span className="step-badge">Step 1</span>
                  <div>
                    <h4>Download Sample Excel Template</h4>
                    <p>First download the sample template containing all required customer & vehicle loan columns.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleDownloadSampleExcel}
                  className="btn btn-outline-primary btn-sm btn-download-template"
                >
                  <FiDownload className="btn-icon" /> Download Sample Excel (.xlsx)
                </button>
              </div>

              {/* Step 2: Upload Excel File */}
              <div className="bulk-step-card">
                <div className="bulk-step-header">
                  <span className="step-badge">Step 2</span>
                  <div>
                    <h4>Upload Filled Excel Sheet</h4>
                    <p>Select your `.xlsx`, `.xls`, or `.csv` sheet filled with customer details.</p>
                  </div>
                </div>

                <div className="excel-upload-dropzone">
                  <input
                    type="file"
                    accept=".xlsx, .xls, .csv"
                    id="excelFileInput"
                    onChange={handleExcelFileUpload}
                    className="file-input-hidden"
                  />
                  <label htmlFor="excelFileInput" className="dropzone-label">
                    <FiFile className="dropzone-icon" />
                    {selectedFileName ? (
                      <span className="file-name-text">Selected File: <strong>{selectedFileName}</strong> ({excelParsedData.length} Customers Found)</span>
                    ) : (
                      <span>Click to browse & select Excel file (.xlsx / .csv)</span>
                    )}
                  </label>
                </div>
              </div>

              {/* Step 3: Excel Data Preview Table */}
              {excelParsedData.length > 0 && (
                <div className="excel-preview-box">
                  <div className="preview-header">
                    <h4>Preview Customers to Import ({excelParsedData.length} Rows)</h4>
                  </div>
                  <div className="table-responsive preview-table-container">
                    <table className="customer-table preview-table">
                      <thead>
                        <tr>
                          <th>Loan No</th>
                          <th>Full Name</th>
                          <th>Phone</th>
                          <th>Vehicle No</th>
                          <th>Model</th>
                          <th>Fitness</th>
                          <th>Tax</th>
                          <th>Loan Amount</th>
                          <th>Inst Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {excelParsedData.slice(0, 5).map((row, idx) => (
                          <tr key={idx}>
                            <td>{row['Loan No'] || row['loanNo'] || '-'}</td>
                            <td><strong>{row['Full Name'] || row['name'] || '-'}</strong></td>
                            <td>{row['Phone Number'] || row['phone'] || '-'}</td>
                            <td>{row['Vehicle No'] || row['vehicleNo'] || '-'}</td>
                            <td>{row['Type of Model'] || row['vehicleModel'] || '-'}</td>
                            <td>{row['Fitness of Vehicle'] || row['vehicleFitness'] || '-'}</td>
                            <td>{row['Tax'] || row['roadTax'] || '-'}</td>
                            <td>₹{Number(row['Loan Amount'] || row['loanAmount'] || 0).toLocaleString()}</td>
                            <td>{row['No of Installments'] || row['noOfInstallments'] || 20}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {excelParsedData.length > 5 && (
                      <div className="more-rows-notice">...and {excelParsedData.length - 5} more customer records ready to import.</div>
                    )}
                  </div>
                </div>
              )}

              {/* Modal Actions */}
              <div className="modal-actions">
                <button
                  type="button"
                  onClick={() => setShowBulkModal(false)}
                  className="btn btn-outline-danger"
                  disabled={uploadingBulk}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmBulkImport}
                  className="btn btn-primary"
                  disabled={uploadingBulk || excelParsedData.length === 0}
                >
                  {uploadingBulk ? (
                    <>
                      <span className="btn-spinner"></span> Importing Customers...
                    </>
                  ) : (
                    <>
                      <FiUpload /> Confirm & Import {excelParsedData.length > 0 ? `(${excelParsedData.length})` : ''} Customers
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;