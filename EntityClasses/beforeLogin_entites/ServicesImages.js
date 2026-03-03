const mongoose = require('mongoose');

const ServiceSchema = mongoose.Schema({
  ServiceImageUrl : {type : String, required : true},
  CompanyId : {type : mongoose.Schema.Types.ObjectId, ref : 'Company_DB'}
},{timestamps : true});

module.exports = mongoose.model('ServiceImage',ServiceSchema);