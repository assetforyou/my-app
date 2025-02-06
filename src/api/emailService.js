const nodemailer = require('nodemailer');
const { google } = require('google-auth-library');

const OAuth2 = google.auth.OAuth2;

const oauth2Client = new OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  "https://developers.google.com/oauthplayground"
);

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN
});

async function sendMail(to, subject, text) {
  try {
    const accessToken = await oauth2Client.getAccessToken();

    const transport = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: 'OAuth2',
        user: 'assetforryou@gmail.com', // Your Gmail address
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
        accessToken: accessToken,
      },
    });

    const mailOptions = {
      from: 'Vault Knight <assetforryou@gmail.com>',
      to,
      subject,
      text,
    };

    const result = await transport.sendMail(mailOptions);
    return result;
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
}

module.exports = { sendMail };