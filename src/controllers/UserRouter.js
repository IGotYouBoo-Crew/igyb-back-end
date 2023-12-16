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
const {
    verifyUserRoleAndId,
    onlyAllowAuthorOrAdmin,
    login,
    generateCookie,
    logout,
} = require("./middleware/authMiddleware");

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
// I used :authorId here instead of :userId because it allows for a single middleware to perform all checks rather than write a specific only only for users protections
router.patch("/:authorId",verifyUserRoleAndId, onlyAllowAuthorOrAdmin, async (request, response) => {
    let updatedUser = await updateUserById(request.params.authorId, request.body);
    response.json({
        message: updatedUser,
    });
});

// DELETE
// Deletes a user with matching _id value
router.delete("/:userId", verifyUserRoleAndId, onlyAllowAuthorOrAdmin, async (request, response) => {
    let deletedUser = await deleteUserById(request.params.userId);
    let confirmation = `deleting user: ${deletedUser.username}`;
    response.json({
        message: confirmation,
    });
});

router.post("/signIn", login, generateCookie, async (request, response) => {
    response.json({
        done: request.headers.jwt,
    });
});

router.post("/signOut", logout, generateCookie, async (request, response) => {
    response.json({
        signed: "out",
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
