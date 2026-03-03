const mongoose = require('mongoose');

const resetSchema = mongoose.Schema({
  resetEmailId : {type : String, required : true},
  resetToken : {type : String, required : true},
  resetTokenExpires : {type : String, required : true}
});

const resetCollection = mongoose.model('resetPassword', resetSchema);

module.exports = resetCollection;