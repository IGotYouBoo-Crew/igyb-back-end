const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    date: {type: String, required: true},
    image: {type: String, required: false},
    author: {type: mongoose.Types.ObjectId, ref: 'User'}
});

const Event = mongoose.model("Event", EventSchema);

module.exports = { Event };
