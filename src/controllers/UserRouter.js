// Import Express
const express = require("express");
// Create an instance of an Express Router
const router = express.Router();

// Import our new functions:
const {
    getAllUsers,
    getUserByUsername,
} = require("./functions/UserFunctions");
const { generateUser, generateCookie, targetSelf, logout, login, recogniseCookie, deleteUser, updateUser } = require("./middleware/userMiddleware");
const { verifyUserRoleAndId, onlyAllowAdmin, onlyAllowAuthorOrAdmin } = require("./middleware/authMiddleware");

// Checklist: should include CREATE, READ, UPDATE, DELETE

// CREATE
// request.body must include required fields (TBD when creating users model)
router.post("/newUser", generateUser, generateCookie, async (request, response) => {
    response.json({
        data: request.headers.data || "generateUser middleware not run",
    });
});


// READ

// Show all users
router.get("/", verifyUserRoleAndId, onlyAllowAdmin, async (request, response) => {
    let responseData = {};
    responseData = await getAllUsers();
    response.json({
        data: responseData,
    });
});

// shows a user's data which matches a specified username
router.get("/:username", async (request, response) => {
    let user = await getUserByUsername(request.params.username);
    let responseData = {...user._doc}
    delete responseData.password;
    delete responseData.__v;

    response.json({
        data: responseData,
    });
});

// UPDATE
// Updates the user properties provided in the request.body according to the userId
// I used :authorId here instead of :userId because it allows for 
// a single middleware to perform all checks rather than write a specific only only for users protections
router.patch("/:authorId", verifyUserRoleAndId, onlyAllowAuthorOrAdmin, updateUser,  async (request, response) => {
    response.json({
        message: request.header.updatedUser,
    });
});

// DELETE
// Deletes a user with matching _id value
// I used :authorId here instead of :userId because it allows for 
// a single middleware to perform all checks rather than write a specific only only for users protections
router.delete("/:authorId", verifyUserRoleAndId, onlyAllowAuthorOrAdmin, deleteUser, async (request, response) => {
    let confirmation = `deleting user: ${request.header.deletedUsername}`;
    response.json({
        message: confirmation,
    });
});

// This deletes the user that sends the request.
router.delete("/", verifyUserRoleAndId, targetSelf, onlyAllowAuthorOrAdmin, logout, generateCookie, deleteUser, async (request, response) => {
    let confirmation = `deleting user: ${request.header.deletedUsername}`;
    response.json({
        message: confirmation,
    });
});

router.post("/signIn", login, generateCookie, async (request, response) => {
    response.json({
        username: request.headers.username,
        role: request.headers.role
    });
});

router.post("/signOut", logout, verifyUserRoleAndId, generateCookie, async (request, response) => {
    response.json({
        signed: "out",
    });
});

router.post("/cookieCheck", recogniseCookie, verifyUserRoleAndId, generateCookie, async (request, response) => {
    response.json({
        username: request.headers.username,
        role: request.headers.userRole
    })
})

// This role is here so I can test my auth stuff
router.post("/someOtherProtectedRoute",  verifyUserRoleAndId, generateCookie, async (request, response) => {
    response.json({
        refreshedJWT: request.headers.jwt,
        userRole: request.headers.userRole,
        userId: request.headers.userId,
    });
});

// Export the router so that other files can use it:
module.exports = router;
