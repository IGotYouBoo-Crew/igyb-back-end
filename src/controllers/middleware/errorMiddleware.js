// Import our new event functions:
const { createNewEvent, deleteEventById, updateEventById } = require("../functions/EventFunctions");


// generate/CREATE an event from request body data
const generateEvent = async (request, response, next) => {
    try {

        let responseData = await createNewEvent(request.body);

        request.headers.data = responseData;
        request.headers.title = responseData.title;

        next();

    } catch (error) {
        next(error.message)
    }
};

// UPDATE given event by Id
const updateEvent = async (request, response, next) => {
    try{
        let updatedEvent = await updateEventById(request.params.eventId, request.body);
        request.header.updatedEvent = updatedEvent
        next()
    } catch(error) {
        next(error)
    }
};

// DELETE given event by Id
const deleteEvent = async (request, response, next) => {
    try{
        let deletedEvent = await deleteEventById(request.params.eventId);
        request.header.deletedEventname = deletedEvent.title
        next()
    } catch(error){
        next(error)
    }
};



module.exports = {
    generateEvent,
    deleteEvent,
    updateEvent
}