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
        type: Date,
        required: true,
        default: new Date(),
    },
    boatID: {
        type: String,
        required: true,
    },
    isDone: {
        type: Boolean,
        required: true,
        default: false
    },
    nauticalMiles: {
        type: Number,
        required: true,
        default: 0,
    },
    travelHours: {
        type: Number,
        required: true,
        default: 0
    },
    hoursSailedOnEngine: {
        type: Number,
        required: true,
        default: 0
    },
    hoursSailedOnSails: {
        type: Number,
        required: true,
        default: 0
    },
});

module.exports = mongoose.model("Cruise", CruiseSchema);