const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());

// Create a transporter using SMTP
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: 'assetforryou@gmail.com', // Your Gmail address
    pass: 'oyua igsj yypq wton' // Replace with your generated app password
  }
});

app.post('/api/send-email', async (req, res) => {
  const { fullName, email, inquiryType, message, recipientEmail } = req.body;

  const mailOptions = {
    from: 'assetforryou@gmail.com', // Your Gmail address
    to: recipientEmail,
    subject: `New Inquiry from ${fullName}: ${inquiryType}`,
    text: `
      Name: ${fullName}
      Email: ${email}
      Inquiry Type: ${inquiryType}
      Message: ${message}
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send('Error sending email');
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});