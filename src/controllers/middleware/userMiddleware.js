// Import our new functions:
const { getUserByUsername, createNewUser, getUserById, deleteUserById, updateUserById } = require("../functions/UserFunctions");
const { createUserJwt, getUserDataFromJwt } = require("../functions/JwtFunctions");
const { getRoleNameById } = require("../functions/RoleFunctions");
const { checkUnhashedData } = require("../functions/EncryptionFunctions");



// logs user in, 
// attaches user data as a JWT to the header of the request for cookie generation
// adds username and role name to header for response --> used in front-end state 
const login = async (request, response, next) => {
    try {
        // username and password are required in the request body
        if (!request.body.password || !request.body.username) {
            throw new Error("Please enter username and password");
        }
        // gets the stored user data by username
        let userData = request.body;
        let targetUser = await getUserByUsername(userData.username);

        // throws error if no user with that username is stored
        if (!targetUser) {
            response.status(404);
            throw new Error("User cannot be found");
        }

        // throws error if password doesn't match hashed version in storage
        if (!(await checkUnhashedData(userData.password, targetUser.password))) {
            response.status(400);
            throw new Error("Incorrect password");
        }

        // adds userdata to header in the form of a JWT
        // adds username and user role to the header
        request.headers.jwt = createUserJwt(targetUser);
        request.headers.username = userData.username;
        request.headers.role = targetUser.role.name

        next();

    } catch (error) {
        next(error);
    }
};

// generateCookie is used to generate a cookie containing user data as a JWT
const generateCookie = async (request, response, next) => {
    try {
        // needs a jwt to function
        if (!request.headers.jwt) {
            throw new Error("You need to run verifyUserRoleAndId or login middleware first");
        }
        // 1000ms * 60sec * 60min * 24hr * 14days
        let twoWeeks = 1209600000;
        let expiry = twoWeeks;
        // When logout middleware is passed first, sets cookie to expire immediately
        // this is pretty neat tbh, it overwrites the previous cookie
        if (request.headers.logout) {
            expiry = 0;
        }
        // attaches a cookie to the response
        response.cookie("access_token", request.headers.jwt, { maxAge: expiry, httpOnly: true });

        next();

    } catch (error) {
        next(error);
    }
};

// This receives the cookie and returns the user data
// used to continue user session after page is closed/refreshed
const recogniseCookie = async(request, response, next) => {
    try {
        // responds with noCookie if there is no cookie --> Not an error, since a guest to the site would not have a cookie
        if (!request.cookies.access_token) {
            return response.json({
                noCookie: "user not signed in"
            })
        }

        // gets user data from cookie JWT
        let userData = await getUserDataFromJwt(request.cookies.access_token)

        // gets user data from stored user
        let targetUser = await getUserById(userData._id)

        // if stored user with provided userId does not exist, 
        // or the password from the JWT doesn't match the stored user password, throws error
        if (!targetUser || userData.password !== targetUser.password) {
            throw new Error("Local cookie details do not match information on record")
        }

        // attaches user data to header to be returned
        request.headers.userId = userData._id;
        request.headers.username = userData.username;
        request.headers.userRole = userData.role.name || getRoleNameById(userData.role);

        next()

    } catch (error) {
        next(error)
    }
}

// if there is a userId in the header, then assigns the ID to request.params.authorId
// This is used to bypass needing to perform an extra db lookup for self-targeted routes such as "delete self"
const targetSelf = async (request, response, next) => {
    try {
        request.headers.userId ? request.params.authorId = request.headers.userId : new Error("no userId in header")
        next()
    } catch (error) {
        next(error)
    }
}

// sets logout header --> generates a cookie which expires immediately
const logout = async (request, response, next) => {
    request.headers.logout = true;
    next();
};

// generates a user from request body data
const generateUser = async (request, response, next) => {
    try {

        let responseData = await createNewUser(request.body);

        request.headers.data = responseData;
        request.headers.jwt = createUserJwt(responseData);
        request.headers.username = responseData.username;
        request.headers.role = await getRoleNameById(responseData.role);

        next();

    } catch (error) {
        next(error.message)
    }
};

// deletes given user by Id
const deleteUser = async (request, response, next) => {
    try{
        let deletedUser = await deleteUserById(request.params.authorId);
        request.header.deletedUsername = deletedUser.username
        next()
    } catch(error){
        next(error)
    }
}

const updateUser = async (request, response, next) => {
    try{
        let updatedUser = await updateUserById(request.params.authorId, request.body);
        request.header.updatedUser = updatedUser
        request.headers.jwt = createUserJwt(updatedUser)
        next()
    } catch(error) {
        next(error)
    }
}

const getUser = async (request, response, next) => {
    try {
        let user = await getUserByUsername(request.params.username);
        let responseData = {...user._doc}
        delete responseData.password;
        delete responseData.__v;
        request.headers.data = responseData
        next()
    } catch (error) {
        next(error)
    }
}

module.exports = {
    login,
    generateCookie,
    logout,
    generateUser,
    targetSelf,
    recogniseCookie,
    deleteUser,
    updateUser,
    getUser
};
