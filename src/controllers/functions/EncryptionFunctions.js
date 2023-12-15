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
    encryptString,
    decryptString,
    decryptObject,
    hashString,
    checkUnhashedData,
}