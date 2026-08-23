import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiTruck,
  FiCalendar,
  FiFileText,
  FiCreditCard,
  FiClock,
  FiTarget,
  FiShield,
  FiCheckCircle,
  FiArrowRight,
  FiTrendingUp,
  FiLock,
  FiAward
} from 'react-icons/fi';

const About = () => {
  const { isAuthenticated } = useAuth();

  const features = [
    {
      icon: <FiTruck className="about-card-icon" />,
      title: "Vehicle Loan Management",
      description: "Effortlessly manage vehicle loan files, vehicle details, customer info, and total financing breakdown."
    },
    {
      icon: <FiCalendar className="about-card-icon" />,
      title: "Monthly EMI Tracking",
      description: "Monitor monthly installment statuses, due dates, paid EMIs, and upcoming payments in real-time."
    },
    {
      icon: <FiFileText className="about-card-icon" />,
      title: "Customer Finance Records",
      description: "Centralized repository for comprehensive customer records, agreements, and payment histories."
    },
    {
      icon: <FiCreditCard className="about-card-icon" />,
      title: "Payment Tracking",
      description: "Instant transaction logging, penalty calculations, and transparent payment verification."
    },
    {
      icon: <FiClock className="about-card-icon" />,
      title: "Loan Repayment Schedules",
      description: "Clear timeline visualizations of full repayment schedules, principal balances, and interest rates."
    },
    {
      icon: <FiTrendingUp className="about-card-icon" />,
      title: "Financial Analytics & Export",
      description: "Generate structured financial reports, export to Excel, and track overall portfolio growth."
    }
  ];

  const stats = [
    { value: "100%", label: "EMI Calculation Accuracy" },
    { value: "24/7", label: "System Availability" },
    { value: "Secure", label: "Encrypted Data Storage" },
    { value: "Instant", label: "Excel & PDF Exports" }
  ];

  return (
    <div className="about-container">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="about-hero-badge">
          <FiShield className="badge-icon" /> Trusted Auto Finance Platform
        </div>
        <h1 className="about-hero-title">
          About Matel Auto Finance
        </h1>
        <p className="about-hero-subtitle">
          Empowering auto lenders and finance teams with a modern, streamlined, and highly secure platform to manage vehicle loans and repayment schedules.
        </p>
      </section>

      {/* Stats Section */}
      <section className="about-stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="about-stat-card">
            <h3 className="about-stat-value">{stat.value}</h3>
            <p className="about-stat-label">{stat.label}</p>
          </div>
        ))}
      </section>

      {/* Main Platform Purpose */}
      <section className="about-section about-intro-section">
        <div className="about-card highlight-card">
          <div className="card-header-with-icon">
            <div className="icon-wrapper">
              <FiAward />
            </div>
            <div>
              <h2>Our Platform</h2>
              <p className="about-section-desc">
                Matel Auto Finance provides a simple, structured, and highly organized environment to oversee vehicle financing. Designed to reduce manual paperwork and eliminate tracking errors, our platform delivers full visibility over loan portfolios and monthly collections.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* What We Manage Grid */}
      <section className="about-section">
        <div className="section-header">
          <span className="section-subtitle">Comprehensive Capabilities</span>
          <h2 className="section-title">What We Manage</h2>
        </div>

        <div className="about-grid">
          {features.map((feature, idx) => (
            <div key={idx} className="about-feature-card">
              <div className="feature-icon-box">
                {feature.icon}
              </div>
              <h3 className="feature-card-title">{feature.title}</h3>
              <p className="feature-card-desc">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Our Goal & Mission */}
      <section className="about-section about-goals-section">
        <div className="about-goal-card">
          <div className="goal-icon-box">
            <FiTarget />
          </div>
          <div className="goal-content">
            <h2>Our Goal & Mission</h2>
            <p>
              Our primary goal is to render auto finance management organized, error-free, efficient, and transparent for both finance managers and borrowers.
            </p>
            <ul className="goal-list">
              <li>
                <FiCheckCircle className="check-icon" /> Streamline auto loan tracking and installment workflows
              </li>
              <li>
                <FiCheckCircle className="check-icon" /> Ensure 100% data integrity and payment record precision
              </li>
              <li>
                <FiCheckCircle className="check-icon" /> Provide intuitive reporting and seamless record management
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="about-cta-section">
        <div className="about-cta-card">
          <h2>Ready to Manage Auto Loans Efficiently?</h2>
          <p>Sign in to your Matel Auto Finance dashboard to view active loans, track EMIs, and export financial reports.</p>
          <div className="cta-actions">
            {isAuthenticated ? (
              <Link to="/admin/dashboard" className="btn btn-primary btn-lg">
                <FiShield className="btn-icon" /> Access Dashboard <FiArrowRight className="btn-arrow" />
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

export default About;