const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  email: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  otp: {
    type: String,
  },
  otpGeneratedTime: {
    type: Date,
  },
  isRegistered: {
    type: Boolean,
  }
});

const User = mongoose.model("User", UserSchema);

module.exports = User;
