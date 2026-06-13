const nodemailer = require('nodemailer');

// Keep nodemailer transporter for local fallback
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true, // SSL
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  connectionTimeout: 10000, // 10s
  greetingTimeout: 10000,
  socketTimeout: 15000,
});

/**
 * Send email via Resend HTTP API (uses port 443, not blocked)
 */
const sendViaResend = async (toEmail, subject, html) => {
  const from = process.env.EMAIL_FROM || 'Linko <onboarding@resend.dev>';
  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: toEmail,
      subject,
      html,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || `Resend error: ${response.statusText}`);
  }
  return data;
};

/**
 * Send email via SendGrid HTTP API (uses port 443, not blocked)
 */
const sendViaSendGrid = async (toEmail, subject, html) => {
  const fromEmail = process.env.EMAIL_FROM_EMAIL || process.env.GMAIL_USER || 'no-reply@linko.dev';
  const fromName = process.env.EMAIL_FROM_NAME || 'Linko';
  const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: toEmail }] }],
      from: { email: fromEmail, name: fromName },
      content: [{ type: 'text/html', value: html }],
    }),
  });

  if (!response.ok) {
    let errMsg = `SendGrid error: ${response.statusText}`;
    try {
      const data = await response.json();
      if (data.errors && data.errors[0]) {
        errMsg = data.errors[0].message;
      }
    } catch (e) {}
    throw new Error(errMsg);
  }
};

/**
 * Send a 6-digit OTP to the given email address.
 * @param {string} toEmail  - Recipient email
 * @param {string} otp      - 6-digit OTP string
 * @param {string} name     - Recipient name (for personalisation)
 */
const sendOTPEmail = async (toEmail, otp, name = 'there') => {
  const subject = `${otp} is your Linko verification code`;
  const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
        </head>
        <body style="margin:0;padding:0;background:#F5F3FF;font-family:'Segoe UI',Arial,sans-serif;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background:#F5F3FF;padding:40px 0;">
            <tr>
              <td align="center">
                <table width="480" cellpadding="0" cellspacing="0"
                  style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(79,70,229,0.12);">

                  <!-- Header -->
                  <tr>
                    <td style="background:linear-gradient(135deg,#4F46E5,#7C3AED);padding:32px 40px;text-align:center;">
                      <div style="display:inline-flex;align-items:center;gap:8px;">
                        <div style="width:36px;height:36px;background:rgba(255,255,255,0.2);border-radius:8px;display:inline-block;line-height:36px;text-align:center;font-size:20px;">⚡</div>
                        <span style="color:#fff;font-size:24px;font-weight:800;vertical-align:middle;margin-left:8px;">Linko</span>
                      </div>
                    </td>
                  </tr>

                  <!-- Body -->
                  <tr>
                    <td style="padding:40px 40px 32px;">
                      <h1 style="margin:0 0 8px;font-size:22px;font-weight:700;color:#1E1B4B;">
                        Hi ${name} 👋
                      </h1>
                      <p style="margin:0 0 28px;font-size:15px;color:#6B7280;line-height:1.6;">
                        Use the code below to verify your email and create your Linko account.
                        This code expires in <strong>10 minutes</strong>.
                      </p>

                      <!-- OTP Box -->
                      <div style="background:#EEF2FF;border:2px dashed #818CF8;border-radius:12px;padding:24px;text-align:center;margin-bottom:28px;">
                        <p style="margin:0 0 6px;font-size:12px;font-weight:600;color:#6366F1;letter-spacing:0.08em;text-transform:uppercase;">Your verification code</p>
                        <div style="font-size:42px;font-weight:800;letter-spacing:12px;color:#4F46E5;font-family:'Courier New',monospace;">
                          ${otp}
                        </div>
                      </div>

                      <p style="margin:0;font-size:13px;color:#9CA3AF;line-height:1.6;">
                        If you didn't create a Linko account, you can safely ignore this email.
                        Someone may have entered your email address by mistake.
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background:#F9FAFB;padding:20px 40px;border-top:1px solid #E5E7EB;">
                      <p style="margin:0;font-size:12px;color:#9CA3AF;text-align:center;">
                        © ${new Date().getFullYear()} Linko · Secure URL Shortener
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

  if (process.env.RESEND_API_KEY) {
    console.log('Sending OTP email via Resend...');
    await sendViaResend(toEmail, subject, html);
  } else if (process.env.SENDGRID_API_KEY) {
    console.log('Sending OTP email via SendGrid...');
    await sendViaSendGrid(toEmail, subject, html);
  } else {
    console.log('Sending OTP email via SMTP/Nodemailer...');
    const mailOptions = {
      from: `"Linko" <${process.env.GMAIL_USER}>`,
      to: toEmail,
      subject,
      html,
    };
    await transporter.sendMail(mailOptions);
  }
};

module.exports = { sendOTPEmail };
