const nodemailer = require('nodemailer');

const transportor = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // MUST be false for 587
  auth: {
    user: process.env.GMAIL_PRINTNEST,
    pass: process.env.GMAIL_PASSWORD
  }
});

transportor.verify((error, success) => {
  if (error) {
    console.log("MAIL ERROR ❌", error);
  } else {
    console.log("MAIL SERVER READY ✅");
  }
});

module.exports = transportor;
