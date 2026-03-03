const mongoose = require('mongoose');

const CategorySchema = mongoose.Schema({
  CategoryName : {type : String, required : true, unique : true},
  slug : {type : String, lowercase : true, index : true, required : true, unique : true},
  CategoryDesc : {type : String, required : true},
  CategoryImage : {type : String, required : true},
  OptionalImage : {type : String, required : true},
  isActive : {type : Boolean, default : true}
},{
  timestamps : true
})

module.exports = mongoose.model('Category',CategorySchema);