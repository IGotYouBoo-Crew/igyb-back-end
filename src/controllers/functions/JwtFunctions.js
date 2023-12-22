const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const { decryptObject, encryptString } = require("./EncryptionFunctions");
dotenv.config();

// JWT stuff
let JWT_KEY = process.env.JWT_KEY;
// Makes a JWT

/**
 * Turns data into JWT
 * @date 22/12/2023 - 01:57:05
 *
 * @param {obj} dataForPayload
 * @returns {JWT} JWT encoded payload
 */
function createJwt(dataForPayload) {
    return jwt.sign(dataForPayload, JWT_KEY, { expiresIn: "14d" });
}

//
/**
 * encrypts user data, then generates JWT
 * @date 22/12/2023 - 01:56:16
 *
 * @param {obj} userDetails
 * @returns {JWT}
 */
function createUserJwt(userDetails) {
    let encryptedUserData = encryptString(JSON.stringify(userDetails));
    return createJwt({ data: encryptedUserData });
}

/**
 * verify user's submitted JWT, and the contents within
 * @date 22/12/2023 - 01:59:36
 *
 * @param {JWT} userJwt
 * @returns {JWT.data}
 */
function verifyJwt(userJwt) {
    let verifiedJwt = jwt.verify(userJwt, JWT_KEY, { complete: true });
    return verifiedJwt;
}

/**
 * Extracts payload from JWT and decrypts contents
 * @date 22/12/2023 - 01:56:16
 *
 * @param {JWT} userJwt
 * @returns {obj}
 */
function getUserDataFromJwt(userJwt) {
    let verifiedJwt = verifyJwt(userJwt);
    return decryptObject(verifiedJwt.payload.data);
}

module.exports = {
    createJwt,
    createUserJwt,
    verifyJwt,
    getUserDataFromJwt,
};
