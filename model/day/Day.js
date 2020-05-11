const mongoose = require('mongoose');

const actionSchema = new mongoose.Schema({
    hour: {
        type: Date,
        default: new Date()
    },
    type: {
        type: String,
        default: null
    },
    description:{
        type: String,
        default: null
    }
});
const  weatcherSchema = new mongoose.Schema({
    hour: {
        type: Number,
        default: new Date().getHours(),
    },
    temperature: {
        type: Number,
        default: null,
    },
    pressure: {
        type: Number,
        default: null,
    },
    overcast: {
        type: Number,
        default: null,
    },
    details: {
        type: String,
        default: null,
    }
});

const hourEntryShema = new mongoose.Schema({
    hour: {
        type: Number,
        default: new Date().getHours(),
    },
    compasCourse: {
        type: Number,
        default: null
    },
    latitude: {
        type: Number,
        default: null
    },
    longitude: {
        type: Number,
        default: null
    },
    sailsState: {
        type: String,
        default: null,
    },
    engineState: {
        type: String,
        default: null,
    },
    boatSpeed: {
        type: Number,
        default: null,
    },
    log: {
        type: Number,
        default: null,
    },
    windDirection: {
        type: String,
        default: null,
    },
    windSpeed: {
        type: Number,
        default: null,
    },
    seaState: {
        type: Number,
        max: 9,
        default: null,
    }

});

const waypointSchema = new mongoose.Schema({
    name :{
        type: String,
        default: null,
    },
    latitude: {
        type: Number,
        default: null
    },
    longitude: {
        type: Number,
        default: null
    }
});

const DaySchema = new mongoose.Schema({
    // START USER INPUTS
    userID: {
        type: String,
        required: true,
    },
    cruiseID: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: new Date()
    },
    startHarbor: {
        type: String,
        required: true,
    },
    engineMth: {
        type: Number,
        required: true,
    },
    oil:{
        type: Boolean,
        required: true,
    },
    fuel: {
        type: Number,
        required: true,
    },
    freshWater: {
        type: Number,
        required: true,
    },


    //END USER INPUTS
    endHarbor:{
        type: String,
        default: null,
    },
    marinaCharges:{
        type: String,
        default: null,
    },
    marinaVHF: {
        type: Number,
        default: null,
    },


    // INPUTS ARRAYS
    actionsArray:{
        type: [actionSchema],
        required: true,
        default: []
    },
    weatherArray: {
        type: [weatcherSchema],
        required: true,
        default: []
    },
    hourlyArray: {
        type: [hourEntryShema],
        required: true,
        default: []
    },
    waypointArray: {
        type: [waypointSchema],
        required: true,
        default: []
    },
    receivedForecast: {
        type: String,
        default: null
    },

    //SERVER COUNTS
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


module.exports = mongoose.model("Waypoint", waypointSchema)
module.exports = mongoose.model("Action", actionSchema);
module.exports = mongoose.model("Weather", weatcherSchema);
module.exports = mongoose.model("HourEntry", hourEntryShema)
module.exports = mongoose.model("Day" , DaySchema);