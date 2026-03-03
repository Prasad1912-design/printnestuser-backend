const Razorpay = require('razorpay');

const razorpay = new Razorpay({
  key_id: process.env.Test_Api_Key,
  key_secret: process.env.Test_Key_Secret,
});
 

module.exports = razorpay;