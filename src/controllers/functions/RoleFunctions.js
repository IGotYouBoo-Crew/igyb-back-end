// Require specific models so that we can
// create functionality involving them.
const { Role } = require("../../models/RoleModel");
const { User } = require("../../models/UserModel");

/**
 * returns all Roles in DB
 * @date 22/12/2023 - 01:50:44
 *
 * @async
 * @returns {list} List of Roles in DB
 */
async function getAllRoles() {
    return await Role.find({});
}

// Model.find({field: value}) returns documents
// that have a specified value for a specified field.
/**
 * Returns a list of all users with role: roleName
 * @date 22/12/2023 - 01:50:44
 *
 * @async
 * @param {string} roleName
 * @returns {list} List of Users with role: roleName
 */
async function getUsersWithRole(roleName) {
    // Get the role ID for the role specified.
    let roleID = await getRoleIdByName(roleName);

    // Filter through the Users to find only the ones
    // with the matching role ID.
    return await User.find({ role: roleID }).exec();
}

/**
 * Returns _id value of Role with the name roleName
 * @date 22/12/2023 - 01:50:44
 *
 * @async
 * @param {string} roleName
 * @returns {obj} Role object
 */
async function getRoleIdByName(roleName) {
    let roleQuery = await Role.findOne({ name: roleName }).exec();
    return roleQuery._id.toString();
}

/**
 * Returns name of the Role with _id roleId
 * @date 22/12/2023 - 01:50:44
 *
 * @async
 * @param {string} roleId
 * @returns {string} Name of Role
 */
async function getRoleNameById(roleId) {
    let roleQuery = await Role.findOne({ _id: roleId }).exec();
    return roleQuery.name;
}

// Export the functions for our routes to use.
module.exports = {
    getAllRoles,
    getUsersWithRole,
    getRoleIdByName,
    getRoleNameById,
};