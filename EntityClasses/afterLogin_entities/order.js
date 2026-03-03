const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    userId : {type : mongoose.Schema.Types.ObjectId, ref : "RegisteredUser", required : true},
    items : [
      {
        productId : {type : mongoose.Schema.Types.ObjectId, ref : "Products", required : true},
        qty : {type : Number, required : true},
        basePrice : {type : Number, required : true}
      } // THis is one object
    ],

    totalAmount : {type : Number, required : true},
    totalAmountPaisa : {type : Number},
    razorPayId : {type : String, required : true},
    orderStatus : {type : String, required : true},
    paymentStatus : {type : String, required : true},
    paymentType : {type : String}
  },
  {
    timestamps : true
  }
)

module.exports = mongoose.model('orderMaster',orderSchema);