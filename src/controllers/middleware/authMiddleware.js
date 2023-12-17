// Import our new functions:
const { getUserByUsername, createNewUser, getUserById } = require("../functions/UserFunctions");
const { createUserJwt, verifyUserJwt, getUserDataFromJwt } = require("../functions/JwtFunctions");
const { getRoleIdByName } = require("../functions/RoleFunctions");
const { checkUnhashedData } = require("../functions/EncryptionFunctions");

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

// verifies JWT from cookie and adds user role and user id to the request headers -> to be used for other validation steps
const verifyUserRoleAndId = async (request, response, next) => {
    try {
        if (!request.cookies.access_token) {
            response.status(401);
            throw new Error("User not signed in");
        }
        let givenJwt = request.cookies.access_token;
        let userData = await getUserDataFromJwt(givenJwt);
        request.headers.userId = userData._id;
        request.headers.username = userData.username;
        request.headers.userRole = userData.role.name || userData.role;
        request.headers.userRoleId = userData.role._id || userData.role;

        request.headers.jwt = givenJwt;
        next();
    } catch (error) {
        next(error);
    }
};

const targetSelf = async (request, response, next) => {
    try {
        request.headers.userId ? request.params.authorId = request.headers.userId : new Error("no userId in header")
        next()
    } catch (error) {
        next(error)
    }
}

const onlyAllowAuthorOrAdmin = async (request, response, next) => {
    try {
        if (!request.headers.userId || !request.headers.userRole || !request.cookies.access_token) {
            throw new Error("You need to run verifyUserRoleAndId middleware first");
        }
        if (
            request.params.authorId === request.headers.userId ||
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

const onlyAllowAdmin = async (request, response, next) => {
    try {
        if (!request.headers.userRole) {
            throw new Error("You need to run verifyUserRoleAndId middleware first");
        }
        if (request.headers.userRole === (await getRoleIdByName("Admin"))) {
            next();
        } else {
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
    validateUserJwt,
    verifyUserRoleAndId,
    onlyAllowAuthorOrAdmin,
    login,
    generateCookie,
    logout,
    onlyAllowAdmin,
    generateUser,
    targetSelf,
    recogniseCookie
};
