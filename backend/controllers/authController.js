const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

// Helper to generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'matel_auto_finance_secure_jwt_secret_key_2026_xyz',
    { expiresIn: '7d' }
  );
};

// @desc    Authenticate admin & get token
// @route   POST /api/auth/login
// @access  Public
const loginAdmin = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Backend validation for required fields
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required.'
      });
    }

    if (!password) {
      return res.status(400).json({
        success: false,
        message: 'Password is required.'
      });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Compare bcrypt password
    const isMatch = await bcrypt.compare(password, admin.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const token = generateToken(admin._id, admin.role);

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Login Controller Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

// @desc    Get current authenticated admin user profile
// @route   GET /api/auth/me
// @access  Private (Admin)
const getMe = async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      admin: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }
    });
  } catch (error) {
    console.error('GetMe Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

// @desc    Send OTP to Admin Email for Password Reset
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No admin account found with this email address.'
      });
    }

    // Generate random 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Set OTP and 10 minutes expiry
    admin.resetOtp = otp;
    admin.resetOtpExpire = new Date(Date.now() + 10 * 60 * 1000);
    await admin.save();

    // Send Email notification
    const sendEmail = require('../utils/sendEmail');
    await sendEmail({
      to: admin.email,
      subject: 'Matel Auto Finance - Password Reset Verification OTP',
      otp
    });

    return res.status(200).json({
      success: true,
      message: 'OTP verification code has been sent to your Gmail inbox.'
    });
  } catch (error) {
    console.error('ForgotPassword Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to process request. Please try again.'
    });
  }
};

// @desc    Verify 6-digit OTP code
// @route   POST /api/auth/verify-otp
// @access  Public
const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Email and OTP code are required.'
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No admin account found.'
      });
    }

    if (
      !admin.resetOtp ||
      admin.resetOtp !== otp.trim() ||
      !admin.resetOtpExpire ||
      admin.resetOtpExpire < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP verification code.'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'OTP verified successfully.'
    });
  } catch (error) {
    console.error('VerifyOtp Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

// @desc    Reset password after OTP verification
// @route   POST /api/auth/reset-password
// @access  Public
const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Email, OTP, and new password are required.'
      });
    }

    // Password Regex Validation (Min 8 chars, 1 upper, 1 lower, 1 num, 1 special)
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        success: false,
        message: 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character.'
      });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });

    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'No admin account found.'
      });
    }

    // Verify OTP again before updating password
    if (
      !admin.resetOtp ||
      admin.resetOtp !== otp.trim() ||
      !admin.resetOtpExpire ||
      admin.resetOtpExpire < Date.now()
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP code.'
      });
    }

    // Hash new password with bcrypt
    const salt = await bcrypt.genSalt(10);
    admin.password = await bcrypt.hash(newPassword, salt);
    
    // Clear OTP fields
    admin.resetOtp = null;
    admin.resetOtpExpire = null;

    await admin.save();

    return res.status(200).json({
      success: true,
      message: 'Password reset successfully! Please login with your new password.'
    });
  } catch (error) {
    console.error('ResetPassword Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Something went wrong. Please try again.'
    });
  }
};

module.exports = {
  loginAdmin,
  getMe,
  forgotPassword,
  verifyOtp,
  resetPassword
};

