const mongoose = require('mongoose');
const boatSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    type: {
        type: String,
        required: false,
    },
    MMSI: {
        type: Number,
        required: true,
    },
    draft: {
        type: Number,
        required: false,
    }

});
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
        type: [boatSchema],
        required: true,
        default: []
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