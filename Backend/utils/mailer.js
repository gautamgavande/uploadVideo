
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
     service: "gmail",
     host: "smtp.ethereal.email",
     port: 587,
     secure: false,
     
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


const sendMail = (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: 'gautamgavande2436@gmail.com',
    subject,
    text,
    html,
  };
  console.log(mailOptions)
  return transporter.sendMail(mailOptions, (error, info) => {
     if (error) {
       return console.log('Error sending test email:', error);
     }
     console.log('Test email sent:', info.response);
   });
};

module.exports = { sendMail };
