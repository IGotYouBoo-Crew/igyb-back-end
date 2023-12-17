// Require specific models so that we can 
// create functionality involving them.
const { User } = require('../../models/UserModel');
const { hashString } = require('./EncryptionFunctions');
const { getRoleIdByName } = require('./RoleFunctions');

// checklist: Create, Read, Update, Delete

// CREATE
async function createNewUser(userDetails){
    // hash user password
    userDetails.password = await hashString(userDetails.password)
    // gives user Superstar role if none provided
    !userDetails.role ? userDetails.role = await getRoleIdByName("Superstar") : ""
    return await User.create(userDetails)
}

// READ
// Model.find({}) returns all documents in a collection.
async function getAllUsers(){
    return await User.find({}, "-password").populate("role");
    
}

async function getUserByUsername(username){
    // finds one user with matching username
    return await User.findOne({username: username}).populate("role").exec()
}

async function getUserById(userId){
    // finds user with matching userId
    return await User.findById(userId).populate("role").exec()
}

// UPDATE
async function updateUserById(userId, updatedUserData){
    return await User.findByIdAndUpdate(userId, updatedUserData, { runValidators: true, returnDocument: 'after' }).exec()
}

// DELETE
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