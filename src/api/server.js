/**
 * Contact-form email API. Run with: npm run server
 * Loads root `.env` (never commit real credentials).
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());

app.post('/api/send-email', async (req, res) => {
  const { fullName, email, inquiryType, message, recipientEmail } = req.body;

  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const smtpHost = process.env.SMTP_HOST || 'smtp.gmail.com';
  const smtpPort = parseInt(process.env.SMTP_PORT || '587', 10);
  const smtpFrom = process.env.SMTP_FROM || smtpUser;
  const smtpTo = recipientEmail || process.env.SMTP_TO;

  if (!smtpUser || !smtpPass || !smtpTo) {
    console.error('Missing SMTP_USER, SMTP_PASS, or recipient (body recipientEmail / SMTP_TO).');
    return res.status(503).json({ message: 'Email service is not configured.' });
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
  });

  const mailOptions = {
    from: smtpFrom,
    to: smtpTo,
    subject: `Vault Knight inquiry from ${fullName}: ${inquiryType || 'General'}`,
    text: `Name: ${fullName}\nEmail: ${email}\nType: ${inquiryType}\n\n${message}`,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ message: 'Error sending email' });
  }
});

app.listen(PORT, () => {
  console.log(`Mail API listening on http://localhost:${PORT}`);
});
