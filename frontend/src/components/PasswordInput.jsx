import React, { useState } from 'react';
import { FiEye, FiEyeOff, FiLock } from 'react-icons/fi';

const PasswordInput = ({ value, onChange, error, disabled, placeholder = 'Enter your password', name = 'password', id = 'password' }) => {
  const [showPassword, setShowPassword] = useState(false);

  const toggleVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="form-group">
      <label htmlFor={id} className="form-label">
        Password
      </label>
      <div className={`input-wrapper ${error ? 'input-error' : ''}`}>
        <span className="input-icon-left">
          <FiLock />
        </span>
        <input
          type={showPassword ? 'text' : 'password'}
          id={id}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className="form-input password-input"
          autoComplete="current-password"
        />
        <button
          type="button"
          onClick={toggleVisibility}
          className="eye-toggle-btn"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
          tabIndex={-1}
        >
          {showPassword ? <FiEyeOff className="eye-icon" /> : <FiEye className="eye-icon" />}
        </button>
      </div>
      {error && <span className="error-message">{error}</span>}
    </div>
  );
};

export default PasswordInput;
