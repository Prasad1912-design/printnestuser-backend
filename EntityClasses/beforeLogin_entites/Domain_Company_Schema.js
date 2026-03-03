  const mongoose = require('mongoose');

  const CompanyDb = mongoose.connection.useDb('CompanyDB');

  const CompanySchema = mongoose.Schema({
    comapanyDomain : {type : String, required : true, unique : true},
    CompanyName : {type : String, required : true, unique : true},
    createdAt : {type : Date, default : Date.now}
  },{timeStamps : true});

  const Company_Db = CompanyDb.model('Company_DB', CompanySchema);

  module.exports = Company_Db;
