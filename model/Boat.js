const mongoose = require("mongoose");

const boatSchema = new mongoose.Schema({
    userID:{
        type: String,
        required: true,
    },
    name:{
        type: String,
        required: true,
    },
    type:{
        type: String,
        required: false,
    },
    MMSI: {
        type: Number,
        required: true,
    },
    draft:{
        type: Number,
        required: false,
    }

});

module.exports = mongoose.model("Boat", boatSchema);
