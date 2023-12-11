// Import Express
const express = require('express');
// Create an instance of an Express Router
const router = express.Router();

// Import our new functions:
const { getAllUsers, getUserByUsername, createNewUser, getUserById } = require('./functions/UserFunctions');


// Configure routes attached to the router instance

// Show all roles
router.get('/', async (request, response) => {
    let responseData = {};

    responseData = await getAllUsers();

    response.json({
        data: responseData
    });
});

// Show all users with a matching role
// Uses route params, notice the request.params too!
router.get('/:username', async (request, response) => {
    let responseData = {};

    responseData = await getUserByUsername(request.params.username);

    response.json({
        data: responseData
    });
});


router.post('/newUser', async (request, response) => {
    let responseData = await createNewUser(request.body);

    response.json({
        data: responseData
    });
});


// Export the router so that other files can use it:
module.exports = router;