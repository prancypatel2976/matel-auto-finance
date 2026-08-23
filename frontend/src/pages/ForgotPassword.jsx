import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import PasswordInput from '../components/PasswordInput';
import { 
  FiShield, 
  FiMail, 
  FiKey, 
  FiLock, 
  FiCheckCircle, 
  FiAlertCircle, 
  FiArrowLeft,
  FiRefreshCw 
} from 'react-icons/fi';

const ForgotPassword = () => {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password, 4: Success
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [emailError, setEmailError] = useState('');
  const [otpError, setOtpError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  const [serverError, setServerError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // STEP 1: Handle Send OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setEmailError('');
    setServerError('');

    if (!email.trim()) {
      setEmailError('Email is required.');
      return;
    }
    if (!emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', { email: email.trim() });
      if (response.data.success) {
        setSuccessMessage(response.data.message || 'OTP verification code has been sent to your Gmail inbox.');
        setOtp('');
        setStep(2);
      } else {
        setServerError(response.data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Unable to connect to the server. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 2: Handle Verify OTP
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setOtpError('');
    setServerError('');
    setSuccessMessage('');

    if (!otp.trim()) {
      setOtpError('OTP code is required.');
      return;
    }
    if (otp.trim().length !== 6) {
      setOtpError('Please enter the full 6-digit OTP code.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/verify-otp', { email: email.trim(), otp: otp.trim() });
      if (response.data.success) {
        setStep(3);
      } else {
        setServerError(response.data.message || 'Invalid OTP code.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // STEP 3: Handle Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setConfirmPasswordError('');
    setServerError('');

    let isValid = true;

    if (!newPassword) {
      setPasswordError('New password is required.');
      isValid = false;
    } else if (!passwordRegex.test(newPassword)) {
      setPasswordError('Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.');
      isValid = false;
    }

    if (!confirmPassword) {
      setConfirmPasswordError('Please confirm your new password.');
      isValid = false;
    } else if (newPassword !== confirmPassword) {
      setConfirmPasswordError('Passwords do not match.');
      isValid = false;
    }

    if (!isValid) return;

    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        email: email.trim(),
        otp: otp.trim(),
        newPassword
      });

      if (response.data.success) {
        setStep(4);
      } else {
        setServerError(response.data.message || 'Failed to reset password.');
      }
    } catch (err) {
      if (err.response && err.response.data && err.response.data.message) {
        setServerError(err.response.data.message);
      } else {
        setServerError('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page-container">
      <div className="login-card">
        {/* Header Banner */}
        <div className="login-header">
          <div className="login-logo-icon">
            <FiShield />
          </div>
          <h1 className="login-brand-title">MATEL AUTO FINANCE</h1>
          <p className="login-subtitle">Admin Password Recovery</p>
        </div>

        {/* Progress Step Indicator */}
        <div className="wizard-steps">
          <div className={`step-dot ${step >= 1 ? 'active' : ''}`}>1</div>
          <div className={`step-line ${step >= 2 ? 'active' : ''}`}></div>
          <div className={`step-dot ${step >= 2 ? 'active' : ''}`}>2</div>
          <div className={`step-line ${step >= 3 ? 'active' : ''}`}></div>
          <div className={`step-dot ${step >= 3 ? 'active' : ''}`}>3</div>
        </div>

        {/* Alert Banners */}
        {serverError && (
          <div className="alert alert-danger" role="alert">
            <FiAlertCircle className="alert-icon" />
            <span>{serverError}</span>
          </div>
        )}

        {successMessage && step === 2 && (
          <div className="alert alert-success" role="alert">
            <FiCheckCircle className="alert-icon" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* STEP 1: Enter Email */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} noValidate className="login-form">
            <div className="form-group">
              <label htmlFor="email" className="form-label">
                Registered Admin Email Address
              </label>
              <div className={`input-wrapper ${emailError ? 'input-error' : ''}`}>
                <span className="input-icon-left">
                  <FiMail />
                </span>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter registered email address"
                  disabled={isLoading}
                  className="form-input"
                  autoComplete="email"
                />
              </div>
              {emailError && <span className="error-message">{emailError}</span>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-block submit-btn"
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  Sending OTP...
                </>
              ) : (
                <>
                  <FiKey className="btn-icon" /> Send Verification OTP
                </>
              )}
            </button>

            <div className="form-footer-link text-center">
              <Link to="/login" className="back-login-link">
                <FiArrowLeft /> Back to Login
              </Link>
            </div>
          </form>
        )}

        {/* STEP 2: Enter 6-digit OTP */}
        {step === 2 && (
          <form onSubmit={handleVerifyOtp} noValidate className="login-form">
            <p className="step-info-text">
              An email containing a 6-digit OTP code has been sent to <strong>{email}</strong>.
            </p>

            <div className="form-group">
              <label htmlFor="otp" className="form-label">
                Enter 6-Digit OTP Code
              </label>
              <div className={`input-wrapper ${otpError ? 'input-error' : ''}`}>
                <span className="input-icon-left">
                  <FiKey />
                </span>
                <input
                  type="text"
                  id="otp"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter 6-digit code (e.g. 584920)"
                  disabled={isLoading}
                  className="form-input otp-input"
                  autoComplete="one-time-code"
                />
              </div>
              {otpError && <span className="error-message">{otpError}</span>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-block submit-btn"
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  Verifying OTP...
                </>
              ) : (
                <>
                  <FiCheckCircle className="btn-icon" /> Verify OTP
                </>
              )}
            </button>

            <div className="resend-row">
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isLoading}
                className="btn-text-action"
              >
                <FiRefreshCw /> Resend OTP Code
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="btn-text-action"
              >
                Change Email
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: Reset Password */}
        {step === 3 && (
          <form onSubmit={handleResetPassword} noValidate className="login-form">
            <PasswordInput
              id="newPassword"
              name="newPassword"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              error={passwordError}
              disabled={isLoading}
              placeholder="Enter new password"
            />

            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={confirmPasswordError}
              disabled={isLoading}
              placeholder="Confirm new password"
            />

            <button
              type="submit"
              disabled={isLoading}
              className="btn btn-primary btn-block submit-btn"
            >
              {isLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  Resetting Password...
                </>
              ) : (
                <>
                  <FiLock className="btn-icon" /> Reset Password
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 4: Success Message */}
        {step === 4 && (
          <div className="reset-success-box text-center">
            <div className="success-icon-wrapper">
              <FiCheckCircle />
            </div>
            <h2>Password Reset Successful!</h2>
            <p>Your admin account password has been updated in MongoDB Atlas.</p>

            <Link to="/login" className="btn btn-primary btn-block">
              Return to Login
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;
