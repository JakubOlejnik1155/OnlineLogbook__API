const mongoose = require('mongoose');

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
    }
    // token: {
    //     type: String,
    //     required:  true
    // }
});

module.exports = mongoose.model('User', userSchema);