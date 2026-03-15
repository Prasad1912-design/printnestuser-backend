const mongoose = require('mongoose');

const askQyerySchema = new mongoose.Schema({
  userId : {type : mongoose.Schema.Types.ObjectId, ref : 'RegisteredUser'},
  query : {type : text}
},{timestamps : true});

module.exports = mongoose.model('askQuery', askQyerySchema);