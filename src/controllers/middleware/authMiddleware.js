// Import our new functions:
const { getUserByUsername } = require("../functions/UserFunctions");
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
        request.headers.userRole = userData.role._id;
        next();
    } catch (error) {
        next(error);
    }
};


const onlyAllowAuthorOrAdmin = async (request, response, next) => {
    try {
        
        if (!request.headers.userId || !request.headers.userRole || !request.cookies.access_token) {
            throw new Error("You forgot to run verifyUserRoleAndId middleware first you dummy");
        }
        if (
            request.params.authorId === request.headers.userId ||
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
        next();
    } catch (error) {
        next(error);
    }
};


const generateCookie = async (request, response, next) => {
    let twoDays = 1000 * 60 * 60 * 24
    let thirtySec = 1000 * 30
    let expiry = twoDays
    if (request.headers.logout){
        expiry = 0
    }
    response.cookie("access_token", request.headers.jwt, { maxAge: expiry, httpOnly: true });
    next()
}

const logout = async (request, response, next) => {
    request.headers.logout = true
    next()
}

module.exports = {
    validateUserJwt,
    verifyUserRoleAndId,
    onlyAllowAuthorOrAdmin,
    login,
    generateCookie,
    logout
}