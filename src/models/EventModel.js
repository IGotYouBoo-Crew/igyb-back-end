const { Timestamp } = require("mongodb");
const mongoose = require("mongoose");

const EventSchema = new mongoose.Schema({
    host: {type: String, required: true},
    image: {type: String, required: false},
    title: {type: String, required: true},
    date: {type: String, required: true},
    start: {type: String,
        validate: {
        validator: function (v) {
            if (!v) {
            return true;
            }
            return /([01]?[0-9]|2[0-3]):[0-5][0-9]/.test(v);
        },
        message: (props) => `${props.value} is not valid time!`,
        },
        required: true}, 
    finish: {type: String,
        validate: {
        validator: function (v) {
            if (!v) {
            return true;
            }
            return /([01]?[0-9]|2[0-3]):[0-5][0-9]/.test(v);
        },
        message: (props) => `${props.value} is not valid time!`,
        },
        required: true}, 
    ticketLink: {type: String, required: false},
    content: {type: String, required: true},
    author: {type: mongoose.Types.ObjectId, ref: 'User'}
});

const Event = mongoose.model("Event", EventSchema);

module.exports = { Event };
