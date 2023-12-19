// Import Express
const express = require("express");
// Create an instance of an Express Router
const router = express.Router();

// Import our new functions:
const {
    getAllEvents,
    updateEventById,
    deleteEventById,
    getEventById,
} = require("./functions/EventFunctions");
const { generateEvent } = require("./middleware/errorMiddleware");

// Checklist: should include CREATE, READ, UPDATE, DELETE

// CREATE
// request.body must include required fields (TBD when creating events model)
router.post("/newEvent", generateEvent, async (request, response) => {
    response.json({
        data: request.headers.data ||  "generateEvent middleware not run",
    });
});

// READ

// Show all events
router.get("/", async (request, response) => {
    let responseData = {};
    responseData = await getAllEvents();
    response.json({
        data: responseData,
    });
});

// shows a event's data which matches a specified title
router.get("/:eventId", async (request, response) => {
    let responseData = {};

    responseData = await getEventById(request.params.eventId);

    response.json({
        data: responseData,
    });
});

// UPDATE
// Updates the event properties provided in the request.body according to the eventId
router.patch("/:eventId", async (request, response) => {
    let updatedEvent = await updateEventById(request.params.eventId, request.body);
    response.json({
        message: updatedEvent,
    });
});

// DELETE
// Deletes a event with matching _id value
router.delete("/:eventId", async (request, response) => {
    let deletedEvent = await deleteEventById(request.params.eventId);
    let confirmation = `deleting event: ${deletedEvent.title}`;
    response.json({
        message: confirmation,
    });
});

// Export the router so that other files can use it:
module.exports = router;
