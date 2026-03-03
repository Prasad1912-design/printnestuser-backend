const express = require('express');
const mongoose = require('mongoose');
const checkToken = require('../../checkToken');
const razorpay = require('../../config/razorpayConfig');
const crypto = require('crypto');
const {calculateShippingDetails} = require('./calculateShipping');
require("dotenv").config({ path: "../../key.env" });

const cartCollection = require('../../EntityClasses/afterLogin_entities/cartCollection');
const products = require('../../EntityClasses/afterLogin_entities/products');
const orderMaster = require('../../EntityClasses/afterLogin_entities/order');

const router = express.Router();

router.post('/create-order',checkToken, async (request,response)=>{
  const cartData = await cartCollection.find({userId : request.user.id});

  const {distance} = await calculateShippingDetails(request.user.id);
  let totalAmount = distance ? distance * 7.5 : 0;
  let orderItems = [];
  for(let item of cartData)
  {
    var product = await products.findById({_id : item.productId});
    const amountCaalculation = product.basePrice * item.qty;
    totalAmount +=amountCaalculation;

    orderItems.push({productId : product._id, qty : item.qty, basePrice : product.basePrice});
  }
  const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(totalAmount * 100), // convert to paise
      currency: "INR",
      receipt: "receipt_" + Date.now()
    });

    const orderCreated = await orderMaster.create({userId : request.user.id, items : orderItems, totalAmount : totalAmount,
      totalAmountPaisa : razorpayOrder.amount, razorPayId : razorpayOrder.id, orderStatus : "Processing", paymentStatus : "Pending"
    });

    // We save the razorpayOrderId in the collection because when frontend sends the razorpayId after front end we have update that row in collection at that time we will update the row whoes id matches this razorpay id gained from the frontend.

    if(orderCreated)
    {
      response.status(200).json({success : true, razorPayOrder : razorpayOrder});
    }

});

router.post('/verify_payment',checkToken, async (request,response)=>{

  
  const {razorpay_order_id, razorpay_payment_id, razorpay_signature} = request.body.payment_data;

  // 1) Create the signature
  const generated_signature = crypto.createHmac('sha256', process.env.Test_Key_Secret).update(razorpay_order_id + "|" + razorpay_payment_id).digest("hex");

  // 2) COmpare Signature
  if(generated_signature !== razorpay_signature)
  {
    return response.status(400).json({success:false, message : "Invalid Payment Signature"});
    const order = await orderMaster.findOneAndUpdate({razorPayId : razorpay_order_id},{orderStatus : "Cancelled", paymentStatus : "Failed"});
  }

  // To get the Payment type by which the user made the paymment.
  const payment = await razorpay.payments.fetch(razorpay_payment_id);
  const payment_method = payment.method;


  const order = await orderMaster.findOneAndUpdate({razorPayId : razorpay_order_id},{orderStatus : "Confirmed", paymentStatus : "Paid", paymentType : payment_method});

  if(!order)
  {
    return response.status(404).json({success : false, message : "Order not found"});
  }

  response.status(200).json({success : true, message : "Payment Done Successfully ✅"}); // dont use the return because it will not go to the below line.
  
  // after payment is done clear the cart
  await cartCollection.deleteMany({userId : request.user.id});
});

router.get('/getOrderDetail', checkToken, async (request,response)=>{
  const orderData = await orderMaster.find({userId : request.user.id, orderStatus : {$ne : 'Processing'}}).populate('items.productId');
  return response.status(200).json({success : true, data : orderData});
})

module.exports = router;