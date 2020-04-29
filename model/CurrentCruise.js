const mongoose = require('mongoose');
const CurrentCruiseSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
    },
    cruiseID: {
        type: String,
        required: true,
    }
});

module.exports = mongoose.model("CurrentCruise", CurrentCruiseSchema);