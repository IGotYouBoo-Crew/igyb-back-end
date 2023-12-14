const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const { getUserByUsername } = require('./UserFunctions');
const { decryptObject, encryptString } = require('./EncryptionFunctions');
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
function verifyJwt(userJwt) {
    let verifiedJwt = jwt.verify(userJwt, JWT_KEY, { complete: true })
    return(verifiedJwt)
};

async function verifyUserJwt(userJwt) {
    let verifiedJwt = verifyJwt(userJwt)
    console.log(verifiedJwt)
    let userData = decryptObject(verifiedJwt.payload.data)
    let knownUser = await getUserByUsername(userData.username)
    console.log(userData)
    console.log(knownUser.password)
    console.log(userData.password)
    if(knownUser.password === userData.password && knownUser.email === userData.email) {
        // creates a new jwt from the encrypted data, which saves having to re-encrypt it again
        return createJwt({data: verifiedJwt.payload.data})
    } else {
        console.log('here');
        
        throw new Error ({message: "invalid user Token"})
    }
}

async function getUserDataFromJwt(userJwt) {
    let verifiedJwt = verifyJwt(userJwt)
    return decryptObject(verifiedJwt.payload.data)
}

module.exports = {
    createJwt,
    createUserJwt,
    verifyJwt,
    verifyUserJwt,
    getUserDataFromJwt
}