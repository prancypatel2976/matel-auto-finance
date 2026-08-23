const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, otp }) => {
  // Always log OTP prominently in backend console for instant testing
  console.log('\n================================================');
  console.log(`📧 OTP Email Notification`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`🔑 Your 6-Digit Verification Code (OTP): [ ${otp} ]`);
  console.log('================================================\n');

  // If SMTP configuration is provided in .env, attempt sending real email via Nodemailer
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    try {
      const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.gmail.com',
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASS
        }
      });

      const htmlContent = `
        <div style="font-family: 'Arial', sans-serif; background-color: #0f172a; padding: 30px; color: #ffffff; border-radius: 12px; max-width: 500px; margin: 0 auto;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #38bdf8; margin: 0; font-size: 24px; font-weight: 800;">MATEL AUTO FINANCE</h1>
            <p style="color: #94a3b8; font-size: 14px; margin-top: 5px;">Smart Auto Financing Management</p>
          </div>
          
          <div style="background-color: #1e293b; padding: 25px; border-radius: 10px; border: 1px solid #334155; text-align: center;">
            <h2 style="color: #ffffff; font-size: 18px; margin-top: 0;">Password Reset Verification OTP</h2>
            <p style="color: #cbd5e1; font-size: 14px;">Use the 6-digit OTP code below to verify your identity and reset your admin password. This code will expire in 10 minutes.</p>
            
            <div style="background: linear-gradient(135deg, #0284c7, #0369a1); color: #ffffff; font-size: 32px; font-weight: 800; letter-spacing: 8px; padding: 15px 25px; border-radius: 8px; display: inline-block; margin: 20px 0;">
              ${otp}
            </div>
            
            <p style="color: #64748b; font-size: 12px; margin-bottom: 0;">If you did not request a password reset, please ignore this email.</p>
          </div>
        </div>
      `;

      await transporter.sendMail({
        from: `"Matel Auto Finance" <${process.env.SMTP_USER}>`,
        to,
        subject,
        html: htmlContent
      });

      console.log(`Real email successfully dispatched to ${to} via SMTP.`);
    } catch (err) {
      console.warn(`SMTP Email delivery warning: ${err.message}. OTP code logged to console above.`);
    }
  }

  return true;
};

module.exports = sendEmail;
