const mongoose = require('mongoose');

const cartSchem = mongoose.Schema({
  productId : {type : mongoose.Schema.Types.ObjectId, ref : 'Products',required : true},
  qty : {type : Number, require : true},
  userId : {type : mongoose.Schema.Types.ObjectId, ref : 'RegisteredUser'}
},{timestamps : true});


module.exports = mongoose.model('cartCollection', cartSchem);