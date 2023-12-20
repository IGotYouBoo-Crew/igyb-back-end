const mongoose = require("mongoose");
const dayjs = require('dayjs')

// var localizedFormat = require('dayjs/plugin/localizedFormat')
// dayjs.extend(localizedFormat)

// dayjs().format('L')


console.log("DATE FILE TO TEST DATE FORMATS");
console.log(dayjs().format('L')) 
console.log(dayjs().format('DD/MM/YYYY')) 

// const EventDateSchema = new mongoose.Schema({
//     date: {type: String}
// });

// const EventDate = mongoose.model("EventDate", EventDateSchema);

// date = new Date();

// const eventDates = [
//     {date: "25th December 2023"},
//     {date: "20/12/2023"},
//     {date: "tomorrow"},
//     {date: "25th December 2023"},
// ]


// let eventDatesCreated = EventDate.insertMany(eventDates);
// console.log(eventDatesCreated);
// console.log("New data for event dates created");

// module.exports = { EventDate };
