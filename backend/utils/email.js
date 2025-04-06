// utils/email.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendDownloadLinkEmail = async (toEmail, products) => {
  try {
    const productList = products.map(p => 
      `<li><a href="${p.url}" target="_blank">${p.name}</a></li>`
    ).join('');
    
    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: toEmail,
      subject: 'Your Digital Products Download Links',
      html: `
        <h1>Thank you for your purchase!</h1>
        <p>Here are your download links:</p>
        <ul>${productList}</ul>
        <p>If you have any issues, please contact our support team.</p>
      `
    };
    
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error('Error sending email:', err);
    throw err;
  }
};

module.exports = { sendDownloadLinkEmail };