const mongoose = require('mongoose');

const FacebookUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        required: true,
    }
});
module.exports = mongoose.model("FacebookUser", FacebookUserSchema);
