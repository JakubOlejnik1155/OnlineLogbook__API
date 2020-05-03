const mongoose = require('mongoose');

const CurrentDaySchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
    },
    cruiseID: {
        type: String,
        required: true,
    },
    dayID: {
        type: String,
        required: true,
    }

})



module.exports = mongoose.model("CurrentDay", CurrentDaySchema);