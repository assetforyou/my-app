const express = require('express');
const nodemailer = require('nodemailer');
const app = express();

app.use(express.json()); // To parse JSON request bodies

// Route to handle the email sending
app.post('/api/send-email', async (req, res) => {
  const { fullName, email, inquiryType, message } = req.body;

  // Set up Nodemailer transporter with your email credentials
  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'assetforryou@gmail.com', // Replace with your Gmail address
      pass: 'Paasowrd', // Replace with your Gmail password (consider using OAuth or app-specific passwords)
    },
  });

  // Define the email options
  let mailOptions = {
    from: email, // Sender's email
    to: 'assetforryou@gmail.com', // Recipient's email
    subject: `New Inquiry from ${fullName} - ${inquiryType}`,
    text: `You have received a new message from ${fullName} (${email}):\n\n${message}`,
  };

  // Send the email
  try {
    await transporter.sendMail(mailOptions);
    res.status(200).send({ message: 'Email sent successfully' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).send({ message: 'Failed to send email' });
  }
});

app.listen(5000, () => {
  console.log('Server is running on port 5000');
});
