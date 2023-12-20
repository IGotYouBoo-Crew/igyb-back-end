// Import our new functions:
const { getUserByUsername, createNewUser, getUserById } = require("../functions/UserFunctions");
const { createUserJwt, getUserDataFromJwt } = require("../functions/JwtFunctions");
const { getRoleNameById } = require("../functions/RoleFunctions");
const { checkUnhashedData } = require("../functions/EncryptionFunctions");

// Middleware

// verifies JWT from cookie 
// adds [userId, username, userRole, and userRoleId] to the request headers
// These can be used for authorisation
const verifyUserRoleAndId = async (request, response, next) => {
    try {
        // checks cookie exists
        if (!request.cookies.access_token) {
            response.status(401);
            throw new Error("User not signed in");
        }
        // gets user data from jwt within coookie
        let userData = await getUserDataFromJwt(request.cookies.access_token);

        // attaches user data to request headers
        request.headers.userId = userData._id;
        request.headers.username = userData.username;
        request.headers.userRole = userData.role.name || await getRoleNameById(userData.role);
        request.headers.userRoleId = userData.role._id || userData.role;
        request.headers.jwt = request.cookies.access_token;

        next();

    } catch (error) {
        next(error);
    }
};

// Uses request headers and params to validate that user is the author of an object, or an admin
// REQUIRES verifyUserRoleAndId middleware first --> needs request header data
const onlyAllowAuthorOrAdmin = async (request, response, next) => {
    try {
        // checks that all required data is available
        if (!request.headers.userId || !request.headers.userRole || !request.cookies.access_token) {
            throw new Error("You need to run verifyUserRoleAndId middleware first");
        }
        if (
            // checks ":authorId" (from params) against userId (from header) OR
            request.params.authorId === request.headers.userId ||
            // checks user is an Admin
            request.headers.userRole === ("Admin")
        ) {
            next();
        } else {
            response.status(403);
            throw new Error("You are not authorised to access this route");
        }
    } catch (error) {
        next(error);
    }
};

// similar to the above, but only allows admin
const onlyAllowAdmin = async (request, response, next) => {
    try {
        // throws error if userRole is missing from request header
        if (!request.headers.userRole) {
            throw new Error("You need to run verifyUserRoleAndId middleware first");
        }
        // passes if userRole is Admin
        if (request.headers.userRole === "Admin") {
            next();
        } else {
            // throws 403 error if user is not admin
            response.status(403);
            throw new Error("You are not authorised to access this route");
        }
    } catch (error) {
        next(error);
    }
};

module.exports = {
    verifyUserRoleAndId,
    onlyAllowAuthorOrAdmin,
    onlyAllowAdmin,
};
