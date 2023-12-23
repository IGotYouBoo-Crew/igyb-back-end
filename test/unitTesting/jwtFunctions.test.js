const {
    createJwt,
    createUserJwt,
    verifyJwt,
    getUserDataFromJwt,
} = require("../../src/controllers/functions/JwtFunctions");
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
describe("RoleFunctions functions work as expected", () => {
    test("createJwt function exists and returns expected value", async () => {
        let payload = {payload:"payload"}
        let response = await createJwt(payload);
        testJWT = response
        expect(typeof response).toEqual("string");
        expect(response).not.toEqual(payload)
        expect(response.errors).toEqual(undefined);
    });
    
    test("createUserJwt function exists and returns expected value", async () => {
        newUserData = {
            email: "somePostedUser@email.com",
            password: "Password1",
            username: "testUser",
            pronouns: "he/him",
        };
        userJwt = await createUserJwt(newUserData);
        expect(typeof userJwt).toEqual("string");
        expect(userJwt).not.toEqual(newUserData);
        expect(userJwt.errors).toEqual(undefined);
    });

    test("verifyJwt function exists and returns expected value", async () => {
        let response = await verifyJwt(userJwt);
        expect(response).toHaveProperty("header");
        expect(response).toHaveProperty("payload");
        expect(response).toHaveProperty("signature");
        expect(response.errors).toEqual(undefined);
    });

    test("getUserDataFromJwt function exists and returns expected value", async () => {
        let response = await getUserDataFromJwt(userJwt);
        expect(response).toEqual(newUserData);
    });
});
