const mongoose = require('mongoose');

const logedUserSchema = new mongoose.Schema({
    id:{
        type: String,
        required: true
    },
    jwt:{
        type: String,
        required: true
    }
});

module.exports = mongoose.model("LoggedUser", logedUserSchema);