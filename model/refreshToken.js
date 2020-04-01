const mongoose = require('mongoose');

const refreshToken = new mongoose.Schema({
    RJwt:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model("refreshToken", refreshToken);