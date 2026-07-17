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

/**
 * Batch import endpoint (optional). This endpoint is a secure stub: to enable
 * server-side imports you must set `IMPORT_ADMIN_SECRET` and provide a
 * `FIREBASE_SERVICE_ACCOUNT` (JSON string or path) so the server can initialize
 * the Firebase Admin SDK. Without these env vars the endpoint returns 501.
 *
 * Expected body: { adminSecret: string, collection: string, items: [ ... ] }
 */
app.post('/api/import-batch', async (req, res) => {
  const { adminSecret, collection: colName, items } = req.body || {};
  if (!process.env.IMPORT_ADMIN_SECRET || !process.env.FIREBASE_SERVICE_ACCOUNT) {
    return res.status(501).json({ message: 'Server-side import not configured. Set IMPORT_ADMIN_SECRET and FIREBASE_SERVICE_ACCOUNT.' });
  }
  if (adminSecret !== process.env.IMPORT_ADMIN_SECRET) {
    return res.status(403).json({ message: 'Unauthorized' });
  }

  // Lazy-load firebase-admin to avoid requiring it in the client dev flow
  try {
    // eslint-disable-next-line global-require
    const admin = require('firebase-admin');
    if (!admin.apps.length) {
      const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({ credential: admin.credential.cert(svc) });
    }
    const dbAdmin = admin.firestore();
    const colRef = dbAdmin.collection(colName || 'customAssets');
    const results = [];
    for (const item of items || []) {
      const docRef = colRef.doc();
      await docRef.set({ ...item, id: docRef.id });
      results.push({ ok: true });
    }
    return res.json({ ok: true, imported: results.length });
  } catch (err) {
    console.error('import-batch error', err);
    return res.status(500).json({ message: 'Import failed', error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`Mail API listening on http://localhost:${PORT}`);
});
