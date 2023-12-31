// Require Event model so that we can 
// create functionality involving them.
const { Event } = require('../../models/EventModel');

// CREATE
const createEvent = async (request, response, next) => {
    try {
        const {title, host, image, date, start, finish, ticketLink, content} = request.body
        const event = new Event({
            title, 
            host, 
            image, 
            date, 
            start, 
            finish, 
            ticketLink, 
            content,
            author: request.headers.userId,
        });

        const createdEvent = await event.save();
        return response.json(createdEvent);
    } catch (error) {
        next(error);
    }
}

// READ
// Model.find({}) returns all documents in a collection.
const getAllEvents = async (request, response, next) => {
    try {
        const events = await Event.find({}).populate([
            {
                path: "author",
                select: ["username"]
            }
        ]);

        response.json(events);
    } catch (error) {
        next(error);
    }
}

const getEventById = async (request, response, next) => {
    try {
        const event = await Event.findById(request.params.id).populate([
            {
                path: 'author',
                select: ["username"],
            }
        ]);

        if(!event) {
            const error = new Error("Oops, that event was not found");
            return next(error);
        }

        return response.json(event);
    } catch (error) {
        next(error);
    }
}

// UPDATE
const updateEvent = async (request, response, next) => {
    try {

        const event = await Event.findByIdAndUpdate(request.params.id, request.body, { runValidators: true, returnDocument: 'after' });
        
        if(!event) {
            const error = new Error("Oops, that event was not found");
            next(error);
            return;
        } else {
                return response.json(event);
        }
    } catch (error) {
        next(error);
    }
}

// DELETE
const deleteEvent = async (request, response, next) => {
    try {
        const eventToDelete = await Event.findOneAndDelete({ _id: request.params.id });

        if(!eventToDelete) {
            const error = new Error("Oops, that event was not found");
            return next(error);
        }
        return response.json({
            message: `Event: ${eventToDelete.title} is successfully deleted`,
        })
    } catch (error) {
        next(error);
    }
}

// Export the functions for our routes to use.
module.exports = {
    createEvent,
    getAllEvents,
    getEventById,
    updateEvent,
    deleteEvent
}