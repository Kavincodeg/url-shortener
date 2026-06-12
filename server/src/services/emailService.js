const nodemailer = require('nodemailer');

const createTransporter = () => {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.GMAIL_USER,
      pass: process.env.GMAIL_APP_PASSWORD,
    },
  });
};

const sendOtpEmail = async (email, code) => {
  const transporter = createTransporter();

  const mailOptions = {
    from: `"Linko" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your Linko Verification Code',
    html: `
      <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #4F46E5, #7C3AED); padding: 32px 40px; text-align: center;">
          <h1 style="color: white; font-size: 28px; font-weight: 800; margin: 0; letter-spacing: -0.5px;">⚡ Linko</h1>
          <p style="color: rgba(255,255,255,0.8); margin: 6px 0 0; font-size: 14px;">URL Shortener & Analytics</p>
        </div>

        <!-- Body -->
        <div style="padding: 40px;">
          <h2 style="color: #1E293B; font-size: 20px; font-weight: 700; margin: 0 0 8px;">Your verification code</h2>
          <p style="color: #64748B; font-size: 14px; margin: 0 0 32px; line-height: 1.6;">
            Enter the code below to verify your email and access your Linko account. This is your first and only time you'll need to do this.
          </p>

          <!-- OTP Code -->
          <div style="background: #F8FAFC; border: 2px solid #E2E8F0; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 32px;">
            <p style="color: #64748B; font-size: 12px; font-weight: 600; letter-spacing: 1px; text-transform: uppercase; margin: 0 0 12px;">Verification Code</p>
            <p style="color: #4F46E5; font-size: 42px; font-weight: 800; letter-spacing: 10px; margin: 0; font-family: 'Courier New', monospace;">${code}</p>
          </div>

          <div style="background: #FFF7ED; border: 1px solid #FED7AA; border-radius: 8px; padding: 14px 16px; margin-bottom: 24px;">
            <p style="color: #92400E; font-size: 13px; margin: 0;">
              ⏱ This code expires in <strong>10 minutes</strong>. After verifying, you'll be able to log in directly with just your email — no code needed.
            </p>
          </div>

          <p style="color: #94A3B8; font-size: 12px; margin: 0; line-height: 1.6;">
            If you didn't request this code, you can safely ignore this email. Someone may have entered your email by mistake.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #F8FAFC; padding: 20px 40px; text-align: center; border-top: 1px solid #E2E8F0;">
          <p style="color: #94A3B8; font-size: 12px; margin: 0;">© 2024 Linko · Shorten. Track. Analyze.</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendOtpEmail };
