const mongoose = require('mongoose');

const SocialUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        required: true,
    }
});
module.exports = mongoose.model("SocialUser", SocialUserSchema);
