const mongoose = require('mongoose');

const CruiseSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    sailingArea: {
        type: String,
        required: true,
    },
    harbour: {
        type: String,
        required: true,
    },
    startDate: {
        type: String,
        required: true,
    },
    boatID: {
        type: String,
        required: true,
    },
    isDone: {
        type: Boolean,
        required: true,
        default: false
    }
});

module.exports = mongoose.model("Cruise", CruiseSchema);