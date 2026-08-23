import React from 'react';
import { FiTrendingUp, FiShield } from 'react-icons/fi';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-brand">
          <div className="footer-logo">
            <FiTrendingUp className="footer-logo-icon" />
            <span>MATEL AUTO FINANCE</span>
          </div>
          <p className="footer-tagline">Smart Auto Financing Management & Enterprise Administration Platform.</p>
        </div>

        <div className="footer-meta">
          <div className="security-badge">
            <FiShield className="badge-icon" />
            <span>256-bit Encrypted Admin Portal</span>
          </div>
          <p className="copyright">&copy; {new Date().getFullYear()} Matel Auto Finance. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
