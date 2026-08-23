import React from 'react';
import { Link } from 'react-router-dom';
import { FiAlertTriangle, FiHome } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <FiAlertTriangle className="not-found-icon" />
        <h1>404 - Page Not Found</h1>
        <p>The page or route you are looking for does not exist on Matel Auto Finance.</p>
        <Link to="/" className="btn btn-primary">
          <FiHome className="btn-icon" /> Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
