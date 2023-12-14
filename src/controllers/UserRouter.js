// Import Express
const express = require('express');
// Create an instance of an Express Router
const router = express.Router();

// Import our new functions:
const { getAllUsers, getUserByUsername, createNewUser, deleteUserById, updateUserById } = require('./functions/UserFunctions');
const { createUserJwt, verifyUserJwt, getUserDataFromJwt } = require('./functions/JwtFunctions');
const { getRoleIdByName } = require('./functions/RoleFunctions');


// Middleware
const validateUserJwt = async (request, response, next) => {
    try {
        if (!request.headers.jwt){
            response.status(401)
            throw new Error("no JWT supplied")
        }
        let givenJwt = request.headers.jwt
        console.log(givenJwt)
        request.headers.jwt = await verifyUserJwt(givenJwt)
        next()
        
    } catch (error) {
        next(error)
    }
}

const verifyUserRole = async (request, response, next) => {
    let givenJwt = request.headers.jwt
    let userData = getUserDataFromJwt(givenJwt)
    request.headers.userId = userData._id
    request.headers.userRole = userData.role

    next()
}


// Checklist: should include CREATE, READ, UPDATE, DELETE

// CREATE
// request.body must include required fields (TBD when creating users model)
router.post('/newUser', async (request, response) => {
    let responseData = await createNewUser(request.body);
    let newJWT = createUserJwt(responseData)
    response.json({
        data: responseData,
        JWT: newJWT
    });
});

// READ

// Show all users
router.get('/', async (request, response) => {
    let responseData = {};
    responseData = await getAllUsers();
    response.json({
        data: responseData
    });
});

// shows a user's data which matches a specified username
router.get('/:username', async (request, response) => {
    let responseData = {};

    responseData = await getUserByUsername(request.params.username);

    response.json({
        data: responseData
    });
});

// UPDATE
// Updates the user properties provided in the request.body according to the userId
router.patch("/:userId", async(request, response) => {
    let updatedUser = await updateUserById(request.params.userId, request.body)
    response.json({
        message: updatedUser
    })
})

// DELETE
// Deletes a user with matching _id value
router.delete("/:userId", async(request, response) => {
    let deletedUser = await deleteUserById(request.params.userId)
    let confirmation = `deleting user: ${deletedUser.username}`
    response.json({
        message: confirmation
    })
})

router.post('/signIn', async (request, response) => {
    let newJWT = createUserJwt(request.body.data);
    response.json({
        done: newJWT
    })
})

router.post('/someOtherProtectedRoute', validateUserJwt, verifyUserRole,  async (request, response) => {
    console.log('flag for route handler')
    response.json({
        refreshedJWT: request.headers.jwt,
        userRole: request.headers.userRole,
        userId: request.headers.userId
    })
})


// Export the router so that other files can use it:
module.exports = router;