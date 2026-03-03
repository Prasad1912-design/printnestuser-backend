const nodemailer = require('nodemailer');

const transportor = nodemailer.createTransport({
  service: 'gmail',
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
