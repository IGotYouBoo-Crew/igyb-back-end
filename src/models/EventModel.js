const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    title: String,
    content: String,
    image: String,
    author: {type: mongoose.Types.ObjectId, ref: 'User'}
});

const Event = mongoose.model("Event", EventSchema);

module.exports = { Event };
