// Require specific models so that we can 
// create functionality involving them.
const { Role } = require('../models/RoleModel');
const { User } = require('../models/UserModel');

// Model.find({}) returns all documents in a collection.
async function getAllUsers(){
    return await User.find({}).populate("role");
}

async function getUserByUsername(username){
    // finds one user with matching username
    return await User.findOne({username: username}).exec()
}

// Export the functions for our routes to use.
module.exports = {
    getAllUsers,
    getUserByUsername
}