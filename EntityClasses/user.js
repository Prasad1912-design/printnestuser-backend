const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({ // Id Automatically Created _id
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
