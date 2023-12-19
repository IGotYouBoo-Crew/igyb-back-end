// Require specific models so that we can 
// create functionality involving them.
const { Event } = require('../../models/EventModel');

// CREATE
async function createNewEvent(eventData){
    return await Event.create(eventData)
}

// READ
// Model.find({}) returns all documents in a collection.
async function getAllEvents(){
    return await Event.find({}).populate("author", "username");
    
}

async function getEventByTitle(eventTitle){
    // finds one event with matching eventTitle
    return await Event.findOne({title: eventTitle}).exec()
}

async function getEventById(eventId){
    // finds event with matching eventId
    return await Event.findById(eventId).exec()
}

// UPDATE
async function updateEventById(eventId, updatedEventData){
    return await Event.findByIdAndUpdate(eventId, updatedEventData, { runValidators: true, returnDocument: 'after' }).exec()
}

// DELETE
async function deleteEventById(eventId){
    return await Event.findByIdAndDelete(eventId).exec()
}

// Export the functions for our routes to use.
module.exports = {
    getAllEvents,
    getEventByTitle,
    getEventById,
    deleteEventById,
    updateEventById,
    createNewEvent
}