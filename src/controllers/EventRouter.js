// Import Express
const express = require('express');
// Create an instance of an Express Router
const router = express.Router();

// Import our new functions:
const { getAllEvents, getEventById } = require('./EventFunctions');



// Configure routes attached to the router instance

// Show all Events
router.get('/', async (request, response) => {
    let responseData = {};

    responseData = await getAllEvents();

    response.json({
        data: responseData
    });
});

// Show all users with a matching role
// Uses route params, notice the request.params too!
router.get('/:EventId', async (request, response) => {
    let responseData = {};

    responseData = await getEventById(request.params.EventId);

    response.json({
        data: responseData
    });
});


// Export the router so that other files can use it:
module.exports = router;