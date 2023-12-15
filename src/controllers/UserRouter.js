// Import Express
const express = require("express");
// Create an instance of an Express Router
const router = express.Router();

// Import our new functions:
const {
    getAllUsers,
    getUserByUsername,
    createNewUser,
    deleteUserById,
    updateUserById,
} = require("./functions/UserFunctions");
const { createUserJwt } = require("./functions/JwtFunctions");
const { verifyUserRoleAndId, onlyAllowOpOrAdmin, login } = require("./middleware/authMiddleware");

// Checklist: should include CREATE, READ, UPDATE, DELETE

// CREATE
// request.body must include required fields (TBD when creating users model)
router.post("/newUser", async (request, response) => {
    let responseData = await createNewUser(request.body);
    let newJWT = createUserJwt(responseData);
    response.json({
        data: responseData,
        JWT: newJWT,
    });
});

// READ

// Show all users
router.get("/", async (request, response) => {
    let responseData = {};
    responseData = await getAllUsers();
    response.json({
        data: responseData,
    });
});

// shows a user's data which matches a specified username
router.get("/:username", async (request, response) => {
    let responseData = {};

    responseData = await getUserByUsername(request.params.username);

    response.json({
        data: responseData,
    });
});

// UPDATE
// Updates the user properties provided in the request.body according to the userId
router.patch("/:userId", verifyUserRoleAndId, onlyAllowOpOrAdmin, async (request, response) => {
    let updatedUser = await updateUserById(request.params.userId, request.body);
    response.json({
        message: updatedUser,
    });
});

// DELETE
// Deletes a user with matching _id value
router.delete("/:userId", verifyUserRoleAndId, onlyAllowOpOrAdmin, async (request, response) => {
    let deletedUser = await deleteUserById(request.params.userId);
    let confirmation = `deleting user: ${deletedUser.username}`;
    response.json({
        message: confirmation,
    });
});

router.post("/signIn", login, async (request, response) => {
    response.cookie("access_token", request.headers.jwt, { httpOnly: true });
    response.json({
        done: request.headers.jwt,
    });
});

// This role is here so I can test my auth stuff
router.post("/someOtherProtectedRoute", verifyUserRoleAndId, async (request, response) => {
    response.json({
        refreshedJWT: request.headers.jwt,
        userRole: request.headers.userRole,
        userId: request.headers.userId,
    });
});


// Export the router so that other files can use it:
module.exports = router;
