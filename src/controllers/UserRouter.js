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
const { createUserJwt, verifyUserJwt, getUserDataFromJwt } = require("./functions/JwtFunctions");
const { getRoleIdByName } = require("./functions/RoleFunctions");
const { hashString, checkUnhashedData } = require("./functions/EncryptionFunctions");

// Middleware
const validateUserJwt = async (request, response, next) => {
    try {
        // throws error if no jwt attached
        if (!request.headers.jwt) {
            response.status(401);
            throw new Error("No JWT Attached");
        }
        // verifies jwt and continues to next middleware
        let givenJwt = request.headers.jwt;
        request.headers.jwt = await verifyUserJwt(givenJwt);
        next();
    } catch (error) {
        next(error);
    }
};

// verifies JWT and adds user role and user id to the request headers -> to be used for other validation steps
const verifyUserRoleAndId = async (request, response, next) => {
    try {
        if (!request.headers.jwt) {
            response.status(401);
            throw new Error("No JWT Attached");
        }
        let givenJwt = request.headers.jwt;
        let userData = await getUserDataFromJwt(givenJwt);
        request.headers.userId = userData._id;
        request.headers.userRole = userData.role;
        next();
    } catch (error) {
        next(error);
    }
};

const onlyAllowOpOrAdmin = async (request, response, next) => {
    try {
        if (!request.headers.userId || !request.headers.userRole || !request.headers.jwt) {
            throw new Error("You forgot to run verifyUserRoleAndId middleware first you dummy");
        }
        if (
            request.params.userId === request.headers.userId ||
            request.headers.userRole === (await getRoleIdByName("Admin"))
        ) {
            next();
        } else {
            response.status(403);
            throw new Error(
                "You are not authorised to make these changes to another user's account"
            );
        }
    } catch (error) {
        next(error);
    }
};

const login = async (request, response, next) => {
    try {
        if (!request.body.password || !request.body.username){
            throw new Error("Please enter username and password")
        }
        let userData = request.body
        let targetUser = await getUserByUsername(userData.username)
        if (!targetUser) {
            response.status(404)
            throw new Error("User cannot be found")
        }
        console.log('flag')
        if (!await checkUnhashedData(userData.password, targetUser.password)) {
            response.status(400)
            throw new Error("Incorrect password")
        }
        console.log('flag2');
        
        request.headers.jwt = createUserJwt(targetUser)
        next()
    } catch (error) {
        next(error)
    }

}

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
    console.log('flag3')
    response.cookie("access-token", request.headers.jwt, { httpOnly: true });
    console.log('flag4')
    response.json({
        done: request.headers.jwt,
    });
});

router.post("/someOtherProtectedRoute", verifyUserRoleAndId, async (request, response) => {
    response.json({
        refreshedJWT: request.headers.jwt,
        userRole: request.headers.userRole,
        userId: request.headers.userId,
    });
});

// Export the router so that other files can use it:
module.exports = router;
