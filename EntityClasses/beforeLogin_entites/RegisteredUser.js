const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  emailId: { type: String, required: true, lowercase: true, unique: true },
  password: { type: String }, // Never send the password while in select query by default it is true, // hashed

  provider: {type: String, enum : ['local','google'], default: 'google'},
  googleId: {type: String, default: null},
  isEmailVerified: {type: Boolean, default: false},

  fileUrl: {type: String, default: ""}, // Common for both local stores the cloudinary url and google user stores the google pic url

  // Company Information
  companyName: { type: String, default: "" },
  companyAddress: { type: String, default: "" },
  primaryOwner: { type: String, default: "" },
  contactNo: { type: String, default: "" },
  landlineNo: { type: String, default: "" },
  residentialAddress: { type: String, default: "" },
  residentialAddressOptional: { type: String, default: "" },
  state: { type: String, default: "" },
  city: { type: String, default: "" },
  pincode: { type: String, default: "" },
  CompanyId : {type : mongoose.Schema.Types.ObjectId, ref : 'Company_DB'},
}, { timestamps: true });

module.exports = mongoose.model('RegisteredUser', userSchema);
