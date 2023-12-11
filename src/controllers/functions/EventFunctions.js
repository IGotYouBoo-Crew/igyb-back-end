// Require specific models so that we can 
// create functionality involving them.
const { Event } = require('../../models/EventModel');

// Model.find({}) returns all documents in a collection.
async function getAllEvents(){
    return await Event.find({}).populate("author", "username");
}

async function getEventById(EventId){
    // finds one user with matching username
    return await Event.findOne({id: EventId}).exec()
}

// Export the functions for our routes to use.
module.exports = {
    getAllEvents,
    getEventById
}