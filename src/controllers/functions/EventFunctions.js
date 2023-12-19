// Require Event model so that we can 
// create functionality involving them.
const { Event } = require('../../models/EventModel');

// CREATE
const createEvent = async (request, response, next) => {
    try {
        const {host, image, title, date, start, finish, ticketLink, content} = request.body
        const event = new Event({
            host, 
            image, 
            title, 
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
const updateEventById = async (request, response, next) => {
    try {

        const event = await Event.findById(request.params.id);
        console.log(event)

        if(!event) {
            const error = new Error("Oops, that event was not found");
            next(error);
            return;
        } else {
            async function handleUpdateEventData(eventData) {
                const {host, image, title, date, start, finish, ticketLink, content} = eventData;
                event.host = host || event.host;
                event.image = image || event.image;
                event.title = title || event.title;
                event.date = date || event.date;
                event.start = start || event.start;
                event.finish = finish || event.finish;
                event.ticketLink = ticketLink || event.ticketLink;
                event.content = content || event.content;
                const updatedEvent = await event.save();
                return response.json(updatedEvent);
            }
    
            handleUpdateEventData(request.body);
        }

        
    } catch (error) {
        next(error);
    }
}

// DELETE
const deleteEventById = async (request, response, next) => {
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
    updateEventById,
    deleteEventById
}