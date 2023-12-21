const mongoose = require("mongoose");
const dayjs = require('dayjs');
var localizedFormat = require('dayjs/plugin/localizedFormat')
dayjs.extend(localizedFormat)
const { timeValidators } = require("./validatorFunctions/eventValidators");


const EventSchema = new mongoose.Schema({
    host: { type: String, required: true },
    image: { type: String, required: false },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    start: { type: String, validate: timeValidators, required: true },
    finish: {
        type: String,
        validate: timeValidators,
        required: true,
    },
    ticketLink: { type: String, required: false },
    content: { type: String, required: true },
    author: { type: mongoose.Types.ObjectId, ref: "User" },
});

// Middleware to format the date before saving
EventSchema.pre("save", function (next) {
    // No need to format the date before saving, Mongoose will handle it
    next();
});

// Getter to format the date when retrieving the document
EventSchema.set("toObject", { getters: true });
EventSchema.set("toJSON", { getters: true });

EventSchema.path("date").get(function (value) {
        return dayjs(value).format('ll');
});

const Event = mongoose.model("Event", EventSchema);

module.exports = { Event };
