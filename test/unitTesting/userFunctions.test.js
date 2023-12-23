const {
    getAllUsers,
    getUserByUsername,
    getUserById,
    deleteUserById,
    updateUserById,
    createNewUser,
} = require("../../src/controllers/functions/UserFunctions");
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
describe("UserFunctions functions work as expected", () => {
    test("createNewUser function exists and returns expected value", async () => {
        let newUserData = {
            email: "somePostedUser@email.com",
            password: "Password1",
            username: "testUser",
            pronouns: "he/him",
        };
        let response = await createNewUser(newUserData)
        testUserId = response._id
        expect(response.username).toEqual(newUserData.username)
        expect(response.email).toEqual(newUserData.email)
        expect(response.pronouns).toEqual(newUserData.pronouns)
    });

    test("getAllUsers function exists and returns expected value", async () => {
        let response = await getAllUsers()
        expect(typeof response).toEqual("object")
        expect(response.errors).toEqual(undefined)
    });

    test("getUserByUsername function exists and returns expected value", async () => {
        let response = await getUserByUsername("user1")
        expect(response.username).toEqual("user1")
    });

    test("getUserById function exists and returns expected value", async () => {
        let response = await getUserById(testUserId)
        expect(response.username).toEqual("testUser")
    });
    
    test("updateUserById function exists and returns expected value", async () => {
        let newUserData = {
            username: "testUser2",
        };
        let response = await updateUserById(testUserId, newUserData)
        expect(response.username).toEqual(newUserData.username)
    });

    test("deleteUserById function exists and returns expected value", async () => {
        let response = await deleteUserById(testUserId)
        expect(response._id).toEqual(testUserId)
        response = await getUserById(testUserId)
        expect(response).toEqual(null)
    });

});


