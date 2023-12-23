const {
    encryptString,
    decryptString,
    decryptObject,
    hashString,
    checkUnhashedData,
} = require("../../src/controllers/functions/EncryptionFunctions");
const { default: mongoose } = require("mongoose");
const { app } = require("../../src/server");
const { databaseConnect } = require("../../src/database");

beforeEach(async () => {
    server = app.listen(3030, async () => {
        await databaseConnect();
    });
});

afterEach(() => {
    server.close();
});

afterAll(() => {
    mongoose.disconnect();
});

// Test the functions from UserFunctions.js
describe("EncryptionFunctions functions work as expected", () => {
    test("encryptString function exists and returns expected value", async () => {
        newUserData = {
            email: "somePostedUser@email.com",
            password: "Password1",
            username: "testUser",
            pronouns: "he/him",
        };
        stringToEncrypt = (JSON.stringify(newUserData))
        let response = await encryptString(stringToEncrypt);
        encryptedJSON = response;
        expect(typeof response).toEqual("string");
        expect(response).not.toEqual(stringToEncrypt);
    });

    test("decryptString function exists and returns expected value", async () => {
        someString = "someString"
        let encryptedString = await encryptString(someString);
        console.log(encryptedString)
        let response = await decryptString(encryptedString);
        expect(response).toEqual(someString);
    });

    test("decryptObject function exists and returns expected value", async () => {
        let response = await decryptObject(encryptedJSON);
        expect(response.username).toEqual(newUserData.username)
        expect(response.email).toEqual(newUserData.email)
        expect(response.pronouns).toEqual(newUserData.pronouns)
    });

    test("hashString function exists and returns expected value", async () => {
        someHashedString = await hashString(someString); 
        expect(someHashedString).not.toEqual(someString);
    });

    test("checkUnhashedData function exists and returns expected value", async () => {
        let response = await checkUnhashedData(someString, someHashedString);
        expect(response).toEqual(true);
        response = await checkUnhashedData("someOtherString", someHashedString);
        expect(response).toEqual(false);
    });
});
