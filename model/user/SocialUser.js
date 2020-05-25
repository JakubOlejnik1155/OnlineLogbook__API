const mongoose = require('mongoose');

const SocialUserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    profilePicture: {
        type: String,
        required: true,
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
module.exports = mongoose.model("SocialUser", SocialUserSchema);
