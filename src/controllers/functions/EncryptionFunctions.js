const crypto = require('crypto');
const bcrypt = require('bcrypt')
const dotenv = require('dotenv');
dotenv.config();

// Encryption stuff
let encAlgorithm = 'aes-256-cbc';
let encryptionSalt = process.env.ENC_SALT
let encPrivateKey = crypto.scryptSync(process.env.ENC_KEY, encryptionSalt, 32);
let encIV = crypto.scryptSync(process.env.ENC_IV, encryptionSalt, 16);

// Encrypt string - returns encrypted data

/**
 * Takes string, encrypts it according to env variables
 * @date 22/12/2023 - 00:54:52
 *
 * @param {string} stringToEncrypt 
 * @returns {encryptedString} encrypted string
 */
function encryptString(stringToEncrypt){
    let cipher = crypto.createCipheriv(encAlgorithm, encPrivateKey, encIV);
    return cipher.update(stringToEncrypt, 'utf8', 'hex') + cipher.final('hex');
}

// decrypts data -> returns unencrypted string

/**
 * Takes encrypted string, decrypts it according to env variables
 * @date 22/12/2023 - 00:56:42
 *
 * @param {string} stringToDecrypt
 * @returns {decryptedString} decrypted string
 */
function decryptString(stringToDecrypt){
    let decipher = crypto.createDecipheriv(encAlgorithm, encPrivateKey, encIV);
    return decipher.update(stringToDecrypt, 'hex', 'utf8') + decipher.final('utf8');
}

// Takes JSON with encrypted data -> returns decrypted string

/**
 * Takes JSON with encrypted data, returns as object consisting of decrypted strings
 * @date 22/12/2023 - 00:58:38
 *
 * @param {JSON} objectToDecrypt
 * @returns {Obj} object with unencrypted values
 */
function decryptObject(objectToDecrypt){
    return JSON.parse(decryptString(objectToDecrypt));
}


// Password encryption w salting + hashing

/**
 * Hashes and salts string. 12 salt rounds.
 * @date 22/12/2023 - 00:59:59
 *
 * @async
 * @param {string} stringToHash
 * @returns {hashedString} hashed & salted string
 */
async function hashString(stringToHash) {
    return await bcrypt.hash(stringToHash, 12)
}


/**
 * compares hashed data to unhashed data using bcrypt
 * @date 22/12/2023 - 01:02:38
 *
 * @async
 * @param {string} unhashedData
 * @param {string} hashedData
 * @returns {boolean} true if unhashedData would hash to hashedData
 */
async function checkUnhashedData(unhashedData, hashedData) {
    // returns boolean
    return await bcrypt.compare(unhashedData, hashedData)
}


module.exports = {
    encryptString,
    decryptString,
    decryptObject,
    hashString,
    checkUnhashedData,
}