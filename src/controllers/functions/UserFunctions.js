// Require specific models so that we can 
// create functionality involving them.
const { User } = require('../../models/UserModel');
const { hashString } = require('./EncryptionFunctions');
const { getRoleIdByName } = require('./RoleFunctions');

// checklist: Create, Read, Update, Delete

// CREATE

/**
 * Creates User from UserSchema according to data provided
 * @date 22/12/2023 - 01:05:57
 *
 * @async
 * @param {object} userDetails  {username: string, password: string, email: string, [profilePicture: string,] [pronouns: string]}
 * @returns {object} mongooseSchema
 */
async function createNewUser(userDetails){
    // hash user password
    userDetails.password = await hashString(userDetails.password)
    // gives user Superstar role if none provided
    !userDetails.role ? userDetails.role = await getRoleIdByName("Superstar") : ""
    return await User.create(userDetails)
}

// READ 
// Model.find({}) returns all documents in a collection.

/**
 * Returns a list of all users in DB
 * @date 22/12/2023 - 01:20:41
 *
 * @async
 * @returns {list} all Users in db
 */
async function getAllUsers(){
    return await User.find({}, "-password").populate("role");
    
}

/**
 * Returns object of User whose username matches the one provided
 * @date 22/12/2023 - 01:21:54
 *
 * @async
 * @param {string} username
 * @returns {User} User
 */
async function getUserByUsername(username){
    // finds one user with matching username
    return await User.findOne({username: username}).populate("role").exec()
}

/**
 * Returns object of User whose _id matches userId
 * @date 22/12/2023 - 01:21:54
 *
 * @async
 * @param {string} userId
 * @returns {User} User object
 */
async function getUserById(userId){
    return await User.findById(userId).populate("role").exec()
}

// UPDATE
/**
 * Updates User in DB with _id matching  userId.
 * User data updated == updatedUserData provided.
 * Returns updated User
 * @date 22/12/2023 - 01:21:54
 *
 * @async
 * @param {string} userId
 * @param {obj} updatedUserData
 * @returns {User} updatedUser
 */
async function updateUserById(userId, updatedUserData){
    return await User.findByIdAndUpdate(userId, updatedUserData, { runValidators: true, returnDocument: 'after' }).exec()
}

// DELETE
/**
 * Deletes User from DB whose _id matches userId
 * @date 22/12/2023 - 01:21:54
 *
 * @async
 * @param {string} userId
 * @returns {User}
 */
async function deleteUserById(userId){
    return await User.findByIdAndDelete(userId).exec()
}

// Export the functions for our routes to use.
module.exports = {
    getAllUsers,
    getUserByUsername,
    getUserById,
    deleteUserById,
    updateUserById,
    createNewUser
}