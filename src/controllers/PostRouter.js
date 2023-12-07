// Import Express
const express = require('express');
// Create an instance of an Express Router
const router = express.Router();

// Import our new functions:
const { getAllPosts, getPostById } = require('./Postfunctions');



// Configure routes attached to the router instance

// Show all posts
router.get('/', async (request, response) => {
    let responseData = {};

    responseData = await getAllPosts();

    response.json({
        data: responseData
    });
});

// Show all users with a matching role
// Uses route params, notice the request.params too!
router.get('/:postId', async (request, response) => {
    let responseData = {};

    responseData = await getPostById(request.params.postId);

    response.json({
        data: responseData
    });
});


// Export the router so that other files can use it:
module.exports = router;