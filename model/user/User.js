const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    min: 6,
    max: 255
  },
  password: {
    type: String,
    required: true,
    min: 8,
    max: 1024
  },
  profilePicture: {
    type: String,
    required: false,
    default: null
  },
  authToken: {
    type: String,
    required: true,
    max: 1024,
    default: 0
  },
  isAuthorized: {
    type: Boolean,
    required: true,
    default: 0
  },
  milesSailed: {
    type: Number,
    default: 0
  },
  hours: {
    type: Number,
    default: 0
  },
  onSails: {
    type: Number,
    default: 0
  },
  onEngine: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model("User", userSchema);
