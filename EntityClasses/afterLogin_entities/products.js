const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  categoryId : {type : mongoose.Schema.Types.ObjectId, ref : 'Category'},
  productName : {type : String, required : true, trim : true},
  productSlug : {type: String, required : true, unique : true, lowerCase : true},
  shortDescription : {type : String, required : true},
  longDescription : {type : String, required : true},
  images : [{url : {type : String, required : true}, alt : {type : String}}],
  basePrice : {type: Number, required:true},
  estimatedDelivery : {type : String},
  points : [{text : {type : String}}],
  minQty : {type: Number, default : 100},
  Ratingstar : {type : Number, min : 0, max : 5, default : 4.2},
  isShippable : {type: Boolean, default : true},
  size : {type : String},
  isActive : {type : Boolean, default: true},
},{timestamps : true});

module.exports = mongoose.model('Products', productSchema);