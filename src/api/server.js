require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const { sendMail } = require('./emailService');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, 'client/build')));

// API Routes
app.post('/api/send-email', async (req, res) => {
  try {
    const { fullName, email, inquiryType, message } = req.body;
    
    const subject = `New ${inquiryType} inquiry from ${fullName}`;
    const text = `
      Name: ${fullName}
      Email: ${email}
      Inquiry Type: ${inquiryType}
      Message: ${message}
    `;

    await sendMail('assetforryou@gmail.com', subject, text);
    res.status(200).json({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error in /api/send-email:', error);
    res.status(500).json({ message: 'Failed to send email' });
  }
});

// Handle React routing, return all requests to React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));