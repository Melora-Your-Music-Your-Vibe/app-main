const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 465,
  secure: true, // port 465 = SSL (works on Render); port 587 = STARTTLS (blocked by Render)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  connectionTimeout: 10000, // 10s — fail fast instead of hanging
  socketTimeout: 10000,
});

/**
 * Send OTP email for verification
 */
const sendOTPEmail = async (email, otp, name = 'User') => {
  const mailOptions = {
    from: `"Melora 🎵" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Your Melora Verification Code',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1db954, #1ed760); padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: #fff; font-size: 28px;">🎵 Melora</h1>
          <p style="margin: 5px 0 0; color: rgba(255,255,255,0.9); font-size: 14px;">Your Music, Your Vibe</p>
        </div>
        <div style="padding: 30px; color: #f1f5f9;">
          <p style="font-size: 16px;">Hey ${name},</p>
          <p style="font-size: 14px; color: #94a3b8;">Here's your verification code:</p>
          <div style="background: rgba(29, 185, 84, 0.15); border: 2px solid #1db954; border-radius: 12px; padding: 20px; text-align: center; margin: 20px 0;">
            <span style="font-size: 36px; font-weight: bold; letter-spacing: 8px; color: #1db954;">${otp}</span>
          </div>
          <p style="font-size: 13px; color: #64748b;">This code expires in 10 minutes. Do not share it with anyone.</p>
        </div>
        <div style="padding: 15px 30px; text-align: center; border-top: 1px solid rgba(255,255,255,0.1);">
          <p style="font-size: 12px; color: #475569; margin: 0;">© 2026 Melora. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions); // throws on failure — let caller handle it
};

/**
 * Send password reset email
 */
const sendPasswordResetEmail = async (email, resetUrl, name = 'User') => {
  const mailOptions = {
    from: `"Melora 🎵" <${process.env.SMTP_USER}>`,
    to: email,
    subject: 'Reset Your Melora Password',
    html: `
      <div style="font-family: 'Inter', sans-serif; max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #0f172a, #1e293b); border-radius: 16px; overflow: hidden;">
        <div style="background: linear-gradient(135deg, #1db954, #1ed760); padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: #fff; font-size: 28px;">🎵 Melora</h1>
        </div>
        <div style="padding: 30px; color: #f1f5f9;">
          <p style="font-size: 16px;">Hey ${name},</p>
          <p style="font-size: 14px; color: #94a3b8;">We received a request to reset your password. Click the button below:</p>
          <div style="text-align: center; margin: 25px 0;">
            <a href="${resetUrl}" style="background: #1db954; color: #fff; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 14px; display: inline-block;">Reset Password</a>
          </div>
          <p style="font-size: 13px; color: #64748b;">This link expires in 1 hour. If you didn't request this, please ignore this email.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions); // throws on failure — let caller handle it
};

module.exports = { sendOTPEmail, sendPasswordResetEmail };
