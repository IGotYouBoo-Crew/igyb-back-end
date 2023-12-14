const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const bcrypt = require('bcrypt')
const dotenv = require('dotenv');
const { getUserById } = require('./UserFunctions');
dotenv.config();

// JWT stuff
let JWT_KEY = process.env.JWT_KEY
// Makes a JWT
function createJwt(dataForPayload){
    return jwt.sign(dataForPayload, JWT_KEY, { expiresIn: "30d" })
}

// encrypts user data, then generates JWT
function createUserJwt(userDetails) {
    let encryptedUserData = encryptString(JSON.stringify(userDetails))
    return createJwt({data: encryptedUserData})
}

// verify user's submitted JWT, and the contents within
function verifyUserJwt(userJwt) {
    let verifiedJwt = jwt.verify(userJwt, JWT_KEY, { complete: true })
    let decryptedPayload = JSON.parse(decryptObject(verifiedJwt.payload.data))
    let knownUser = getUserById(decryptedPayload._id)
    if(knownUser.password === decryptedPayload.password && knownUser.email === decryptedPayload.email) {
        // creates a new jwt from the encrypted data, which saves having to re-encrypt it again
        return createJwt({data: verifiedJwt.payload.data})
    } else {
        throw new Error ({message: "invalid user Token"})
    }

}



// Encryption stuff
let encAlgorithm = 'aes-256-cbc';
let encryptionSalt = process.env.ENC_SALT
let encPrivateKey = crypto.scryptSync(process.env.ENC_KEY, encryptionSalt, 32);
let encIV = crypto.scryptSync(process.env.ENC_IV, encryptionSalt, 16);

// Encrypt string - returns encrypted data
function encryptString(stringToEncrypt){
    let cipher = crypto.createCipheriv(encAlgorithm, encPrivateKey, encIV);
    return cipher.update(stringToEncrypt, 'utf8', 'hex') + cipher.final('hex');
}

// decrypts data -> returns unencrypted string
function decryptString(stringToDecrypt){
    let decipher = crypto.createDecipheriv(encAlgorithm, encPrivateKey, encIV);
    return decipher.update(stringToDecrypt, 'hex', 'utf8') + decipher.final('utf8');
}

// Takes JSON with encrypted data -> returns decrypted string
function decryptObject(objectToDecrypt){
    return JSON.parse(decryptString(objectToDecrypt));
}


// Password encryption w salting + hashing
async function hashString(stringToHash) {
    return await bcrypt.hash(stringToHash, 12)
}

async function checkUnhashedData(unhashedData, hashedData) {
    // returns boolean
    return await bcrypt.compare(unhashedData, hashedData)
}


module.exports = {
    createUserJwt,
    verifyUserJwt,
    encryptString,
    decryptString,
    decryptObject,
    hashString,
    checkUnhashedData,
}