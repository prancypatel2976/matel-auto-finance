import React from 'react';
import { FiAlertTriangle } from 'react-icons/fi';

const NotFound = () => {
  return (
    <div className="not-found-container">
      <div className="not-found-card">
        <FiAlertTriangle className="not-found-icon" />

        <h1>404 - Page Not Found</h1>

        <p>
          The page or route you are looking for does not exist on
          Matel Auto Finance.
        </p>
      </div>
    </div>
  );
};

export default NotFound;