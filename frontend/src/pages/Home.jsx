import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  FiLock, 
  FiShield, 
  FiArrowRight
} from 'react-icons/fi';

const Home = () => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="home-container">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">
          Matel Auto Finance
        </h1>
        
        <p className="hero-subtitle">
          Complete Auto Loan & Installment Management Portal
        </p>

        <p className="hero-description">
          Manage active vehicle loans, track upcoming monthly EMI due dates, and oversee car financing with precision and security.
        </p>

        <div className="hero-actions">
          {isAuthenticated ? (
            <Link to="/admin/dashboard" className="btn btn-primary btn-lg">
              <FiShield className="btn-icon" /> Access Admin Dashboard <FiArrowRight className="btn-arrow" />
            </Link>
          ) : (
            <Link to="/login" className="btn btn-primary btn-lg hero-cta-btn">
              <FiLock className="btn-icon" /> Login <FiArrowRight className="btn-arrow" />
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
