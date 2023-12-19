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
            console.log(request.headers.userRole)
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

const login = async (request, response, next) => {
    try {
        if (!request.body.password || !request.body.username) {
            throw new Error("Please enter username and password");
        }
        let userData = request.body;
        let targetUser = await getUserByUsername(userData.username);
        if (!targetUser) {
            response.status(404);
            throw new Error("User cannot be found");
        }
        if (!(await checkUnhashedData(userData.password, targetUser.password))) {
            response.status(400);
            throw new Error("Incorrect password");
        }
        console.log(targetUser)
        request.headers.jwt = createUserJwt(targetUser);
        request.headers.username = userData.username;
        request.headers.role = targetUser.role.name
        next();
    } catch (error) {
        next(error);
    }
};

const generateCookie = async (request, response, next) => {
    try {
        if (!request.headers.jwt) {
            throw new Error("You need to run verifyUserRoleAndId or login middleware first");
        }
        // 1000ms * 60sec * 60min * 24hr * 14days
        let twoWeeks = 1209600000;
        let expiry = twoWeeks;
        // When logout middleware is passed first, sets cookie to expire
        if (request.headers.logout) {
            expiry = 0;
        }
        response.cookie("access_token", request.headers.jwt, { maxAge: expiry, httpOnly: true });
        next();
    } catch (error) {
        next(error);
    }
};

const recogniseCookie = async(request, response, next) => {
    try {
        if (!request.cookies.access_token) {
            return response.json({
                noCookie: "user not signed in"
            })
        }
        let userData = await getUserDataFromJwt(request.cookies.access_token)
        let targetUser = await getUserById(userData._id)
        if (!targetUser || userData.password !== targetUser.password) {
            throw new Error("Local cookie details do not match information on record")
        }
        request.headers.userId = userData._id;
        request.headers.username = userData.username;
        request.headers.userRole = userData.role.name || userData.role;
        // request.headers.jwt = givenJwt;
        next()
    } catch (error) {
        next(error)
    }
}

const logout = async (request, response, next) => {
    request.headers.logout = true;
    next();
};

const generateUser = async (request, response, next) => {
    try {
        let responseData = await createNewUser(request.body);
        request.headers.data = responseData;
        request.headers.jwt = createUserJwt(responseData);
        request.headers.username = responseData.username;
        next();
    } catch (error) {
        next(error.message)
        // return response.status(400).json({
        //     error: error.message,
        // });
    }
};

module.exports = {
    verifyUserRoleAndId,
    onlyAllowAuthorOrAdmin,
    onlyAllowAdmin,
};
