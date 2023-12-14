const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
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
    console.log(verifiedJwt)
    return(verifiedJwt)
};
async function verifyUserJwt(userJwt) {
    let verifiedJwt = jwt.verify(userJwt, JWT_KEY, { complete: true })
    let decryptedPayload = decryptObject(verifiedJwt.payload.data)
    console.log(decryptedPayload)
    let knownUser = await User.findById(decryptedPayload._id).exec()
    if(knownUser.password === decryptedPayload.password && knownUser.email === decryptedPayload.email) {
        // creates a new jwt from the encrypted data, which saves having to re-encrypt it again
        return createJwt({data: verifiedJwt.payload.data})
    } else {
        throw new Error ({message: "invalid user Token"})
    }

}


module.exports = {
    createJwt,
    createUserJwt,
    verifyJwt,
    verifyUserJwt,
}