import React, { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/PasswordInput';
import { FiMail, FiShield, FiAlertCircle, FiLock, FiKey } from 'react-icons/fi';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // If already authenticated as Admin, automatically redirect to Dashboard and replace history
  if (isAuthenticated) {
    return <Navigate to="/admin/dashboard" replace />;
  }

  // Email Regex Pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  // Password Regex Pattern (Min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special character)
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  const validateForm = () => {
    let isValid = true;
    setEmailError('');
    setPasswordError('');
    setServerError('');

    // Email validation
    if (!email.trim()) {
      setEmailError('Email is required.');
      isValid = false;
    } else if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      isValid = false;
    }

    // Password validation
    if (!password) {
      setPasswordError('Password is required.');
      isValid = false;
    } else if (!passwordRegex.test(password)) {
      setPasswordError('Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.');
      isValid = false;
    }

    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Clear previous errors
    setServerError('');

    // Step 1 & 2: Validate Email and Password
    if (!validateForm()) {
      return; // Do not submit if validation fails
    }

    setIsSubmitting(true);

    try {
      // Step 4 & 5: Send POST request to backend via AuthContext login
      const result = await login(email.trim(), password);

      if (result.success) {
        // Step 8: Redirect to Admin Dashboard and replace history stack
        navigate('/admin/dashboard', { replace: true });
      } else {
        // Step 9: Show backend credential / network / server error
        setServerError(result.message || 'Invalid email or password.');
      }
    } catch (err) {
      setServerError('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* Brand Banner */}
        <div className="login-header">
          <div className="login-logo-icon">
            <FiShield />
          </div>
          <h1 className="login-brand-title">MATEL AUTO FINANCE</h1>
          <p className="login-subtitle">Login</p>
        </div>

        {/* Server Error Alert */}
        {serverError && (
          <div className="alert alert-danger" role="alert">
            <FiAlertCircle className="alert-icon" />
            <span>{serverError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="login-form">
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <div className={`input-wrapper ${emailError ? 'input-error' : ''}`}>
              <span className="input-icon-left">
                <FiMail />
              </span>
              <input
                type="email"
                id="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                disabled={isSubmitting}
                className="form-input"
                autoComplete="email"
              />
            </div>
            {emailError && <span className="error-message">{emailError}</span>}
          </div>

          {/* Password Field with Eye Toggle */}
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={passwordError}
            disabled={isSubmitting}
            placeholder="Enter your password"
          />

          {/* Forgot Password Link */}
          <div className="form-group-forgot">
            <Link to="/forgot-password" className="forgot-password-link">
              <FiKey /> Forgot Password?
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary btn-block submit-btn"
          >
            {isSubmitting ? (
              <>
                <span className="btn-spinner"></span>
                Logging in...
              </>
            ) : (
              <>
                <FiLock className="btn-icon" /> Login
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
