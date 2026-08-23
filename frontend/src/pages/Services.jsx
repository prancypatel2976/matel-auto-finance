import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiCreditCard,
  FiCalendar,
  FiUsers,
  FiDollarSign,
  FiFileText,
  FiShield,
  FiArrowRight,
  FiLock,
  FiTrendingUp,
  FiCheck,
  FiLayers
} from 'react-icons/fi';

const Services = () => {
  const { isAuthenticated } = useAuth();

  const services = [
    {
      icon: <FiCreditCard />,
      title: 'Vehicle Loan Management',
      tag: 'Core Feature',
      description: 'Streamline vehicle financing files with complete details on principal amounts, interest rates, tenure, and customer details.',
      features: [
        'Comprehensive vehicle profile tracking',
        'Financing breakdown & total payable',
        'Customizable interest calculation'
      ]
    },
    {
      icon: <FiCalendar />,
      title: 'EMI Tracking & Schedules',
      tag: 'Automation',
      description: 'Keep track of monthly installment statuses, due dates, paid EMIs, and pending amounts with automated tracking.',
      features: [
        'Automated monthly EMI calculation',
        'DueDate notifications & tracking',
        'Partial payment & penalty logging'
      ]
    },
    {
      icon: <FiUsers />,
      title: 'Customer Finance Management',
      tag: 'CRM',
      description: 'Maintain organized records for each borrower, contact details, loan history, and repayment reliability.',
      features: [
        'Centralized customer directory',
        'Individual loan history log',
        'Quick search & profile access'
      ]
    },
    {
      icon: <FiDollarSign />,
      title: 'Payment & Collection Tracking',
      tag: 'Financials',
      description: 'Real-time transaction logging and tracking of incoming monthly collections with complete verification.',
      features: [
        'Instant receipt generation',
        'Clear paid vs pending balances',
        'Audit trail for every transaction'
      ]
    },
    {
      icon: <FiFileText />,
      title: 'Repayment Schedule Generation',
      tag: 'Reporting',
      description: 'Generate clear, itemized repayment schedules specifying principal and interest breakdown per month.',
      features: [
        'Itemized monthly breakdown',
        'Downloadable repayment tables',
        'Export to Excel & PDF formats'
      ]
    },
    {
      icon: <FiShield />,
      title: 'Secure Data & Analytics',
      tag: 'Security',
      description: 'Manage auto finance records securely with role-based admin access, data encryption, and instant backups.',
      features: [
        'Role-based admin authentication',
        'Portfolio summary dashboards',
        'Instant data export & cloud backup'
      ]
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Create Loan Profile',
      description: 'Input vehicle loan parameters, borrower information, total financing amount, and tenure.'
    },
    {
      step: '02',
      title: 'Auto-Generate Schedule',
      description: 'The system automatically calculates monthly EMIs and creates an itemized repayment schedule.'
    },
    {
      step: '03',
      title: 'Track EMI Collections',
      description: 'Record monthly payments as they occur, update statuses, and monitor overdue balances.'
    },
    {
      step: '04',
      title: 'Export & Analyze',
      description: 'Export portfolio summaries to Excel for auditing, record keeping, and financial reporting.'
    }
  ];

  return (
    <div className="services-container">
      {/* Hero Section */}
      <section className="services-hero">
        <div className="services-hero-badge">
          <FiLayers className="badge-icon" /> Professional Auto Financing Solutions
        </div>
        <h1 className="services-hero-title">
          Our Auto Finance Services
        </h1>
        <p className="services-hero-subtitle">
          Comprehensive, reliable, and secure tools designed to simplify vehicle loan administration, EMI tracking, and financial record management.
        </p>
      </section>

      {/* Services Grid Section */}
      <section className="services-section">
        <div className="section-header">
          <span className="section-subtitle">WHAT WE OFFER</span>
          <h2 className="section-title">End-to-End Financing Capabilities</h2>
        </div>

        <div className="services-grid">
          {services.map((service, index) => (
            <div className="service-card" key={index}>
              <div className="service-card-top">
                <div className="service-card-icon">
                  {service.icon}
                </div>
                <span className="service-tag">{service.tag}</span>
              </div>
              <h3 className="service-title">{service.title}</h3>
              <p className="service-description">{service.description}</p>
              <ul className="service-features-list">
                {service.features.map((feat, idx) => (
                  <li key={idx}>
                    <FiCheck className="check-icon" /> {feat}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Workflow Section */}
      <section className="services-section workflow-section">
        <div className="section-header">
          <span className="section-subtitle">SIMPLE PROCESS</span>
          <h2 className="section-title">How Our Platform Works</h2>
        </div>

        <div className="workflow-grid">
          {workflowSteps.map((item, idx) => (
            <div className="workflow-card" key={idx}>
              <div className="workflow-number">{item.step}</div>
              <h3 className="workflow-title">{item.title}</h3>
              <p className="workflow-desc">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Highlight Banner */}
      <section className="services-section">
        <div className="services-security-banner">
          <div className="security-icon-box">
            <FiShield />
          </div>
          <div className="security-content">
            <h2>Bank-Grade Accuracy & Security</h2>
            <p>
              Every transaction, customer record, and repayment calculation is protected by modern encryption, secure session tokens, and automated data backups.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="services-cta-section">
        <div className="services-cta-card">
          <h2>Streamline Your Auto Finance Operations Today</h2>
          <p>Sign in to your Matel Auto Finance account to manage vehicle loans, monitor EMI collections, and download financial reports.</p>
          <div className="cta-actions">
            {isAuthenticated ? (
              <Link to="/admin/dashboard" className="btn btn-primary btn-lg">
                <FiTrendingUp className="btn-icon" /> Access Dashboard <FiArrowRight className="btn-arrow" />
              </Link>
            ) : (
              <Link to="/login" className="btn btn-primary btn-lg">
                <FiLock className="btn-icon" /> Login to Platform <FiArrowRight className="btn-arrow" />
              </Link>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Services;