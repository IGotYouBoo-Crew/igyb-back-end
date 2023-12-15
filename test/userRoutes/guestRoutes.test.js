// Test the routes from server.js
const { default: mongoose } = require("mongoose");
const { databaseConnect } = require("../../src/database");
const { app } = require("../../src/server");
let bcrypt = require("bcrypt");
// Import supertest so we can manage the app/server in tests properly
const request = require("supertest");
const { getRoleIdByName } = require("../../src/controllers/functions/RoleFunctions");
const { verifyJwt } = require("../../src/controllers/functions/JwtFunctions");
var session = require("supertest-session");

var testSession = session(app);

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

describe("server root route exists and returns status hello world", () => {
    test("root route exists and returns status 200", async () => {
        const responseResult = await testSession.get("/");
        expect(responseResult.statusCode).toEqual(200);
    });

    test("root route exists and returns hello world message", async () => {
        const responseResult = await request(app).get("/");
        expect(responseResult.body.message).toEqual("Hello world!");
    });
    test("gets database details", async () => {
        const responseResult = await request(app).get("/databaseHealth");
        console.log(responseResult.body);
        expect(responseResult.body).toHaveProperty("dbModels");
    });
});

describe("UserController routes work and accept/return data correctly", () => {
    // CREATE
    test("POST request.body of newUserData returns newUserData and JWT", async () => {
        let newUserData = {
            email: "postedUser@email.com",
            password: "fakepassword",
            username: "User4",
            pronouns: "he/him",
        };

        const responseResult = await request(app).post("/account/newUser").send(newUserData);
        const responseData = responseResult.body.data;
        // global variable used to access same document later for Update and Delete actions
        testUserId = responseData._id;
        jwt = responseResult.body.JWT;
        let compareEncryptedPassword = bcrypt.compareSync(
            newUserData.password,
            responseData.password
        );
        let superstarRoleID = await getRoleIdByName("Superstar");

        expect(responseResult.body).toHaveProperty("JWT");
        // this verifies the JWT is signed
        expect(verifyJwt(responseResult.body.JWT)).toHaveProperty("signature");

        // this verifies password has encrypted
        expect(compareEncryptedPassword).toEqual(true);

        // verifies all expected properties are there
        expect(responseData).toHaveProperty("email", newUserData.email);
        expect(responseData).toHaveProperty("role", superstarRoleID);
        expect(responseData).toHaveProperty("username", newUserData.username);
        expect(responseData).toHaveProperty("pronouns", newUserData.pronouns);
        expect(responseData).toHaveProperty("_id", testUserId);
    });

    // UPDATE
    test("PATCH request.body of updatedUserData fails if user is not signed in", async () => {
        let updatedUserData = {
            pronouns: "she/her",
        };
        let responseResult = await request(app)
            .patch("/account/" + testUserId)
            .send(updatedUserData);
        expect(responseResult.body).toHaveProperty("errors", "Error: User not signed in");
    });

    // Auth testing testing
    test("no jwt fails with error handling", async () => {
        const responseResult = await request(app).post("/account/someOtherProtectedRoute");
        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

    // DELETE
    test("DELETE userData fails when not original user or admin", async () => {
        const responseResult = await request(app)
            .delete("/account/" + testUserId)
            .set("jwt", jwt);
        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });
});
