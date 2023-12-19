// Test the routes from server.js
const { default: mongoose } = require("mongoose");
const { databaseConnect } = require("../../src/database");
const { app } = require("../../src/server");
let bcrypt = require("bcrypt");
// Import supertest so we can manage the app/server in tests properly
const request = require("supertest");
const { getRoleIdByName } = require("../../src/controllers/functions/RoleFunctions");
var session = require("supertest-session");

var testSession = session(app);
var adminAuthSession;

let loginDetails = {
    password: "fakeadminpassword",
    username: "Admin2",
};

beforeEach(async () => {
    server = app.listen(3030, async () => {
        await databaseConnect();
    });
    // This (attempts to) sign-in as User4 before each test is run
    await testSession.post("/account/signIn").send(loginDetails);
    // If the test uses adminAuthSession, then it will use the signed-in session (with cookie)
    adminAuthSession = testSession;
});

afterEach(() => {
    server.close();
});

afterAll(() => {
    mongoose.disconnect();
});

describe("Signed in as admin UserController routes work and accept/return data correctly", () => {
    // CREATE
    // This test uses request(app) and not adminAuthSession because is used to create the user that we sign in as
    // the adminAuthSession at this point is actually a 404 lol
    test("POST request.body of newAdminData returns newAdminData and JWT", async () => {
        let adminRoleID = await getRoleIdByName("Admin");
        let newAdminData = {
            email: "postedAdmin@email.com",
            password: "fakeadminpassword",
            username: "Admin2",
            pronouns: "ad/min",
            role: adminRoleID,
        };

        const responseResult = await request(app).post("/account/newUser").send(newAdminData);
        const responseData = responseResult.body.data;
        let compareEncryptedPassword = bcrypt.compareSync(
            newAdminData.password,
            responseData.password
        );
        adminUserId = responseData._id.toString();

        // checks everything is in order
        expect(compareEncryptedPassword).toEqual(true);
        expect(responseData).toHaveProperty("email", newAdminData.email);
        expect(responseData).toHaveProperty("role", adminRoleID);
        expect(responseData).toHaveProperty("username", newAdminData.username);
        expect(responseData).toHaveProperty("pronouns", newAdminData.pronouns);
        expect(responseData).toHaveProperty("_id");
    });

    // This test creates a new User that we can then perform tests on.
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
        let compareEncryptedPassword = bcrypt.compareSync(
            newUserData.password,
            responseData.password
        );
        let superstarRoleID = await getRoleIdByName("Superstar");

        expect(compareEncryptedPassword).toEqual(true);
        expect(responseData).toHaveProperty("email", newUserData.email);
        expect(responseData).toHaveProperty("role", superstarRoleID);
        expect(responseData).toHaveProperty("username", newUserData.username);
        expect(responseData).toHaveProperty("pronouns", newUserData.pronouns);
        expect(responseData).toHaveProperty("_id", testUserId);
    });

    // READ
    test("Admin GET '/' route passes", async () => {
        let responseData = await adminAuthSession.get("/account/");
        expect(responseData.status).toEqual(200)
    });

    // UPDATE
    test("Admin PATCH request of another user returns updated userData", async () => {
        let updatedUserData = {
            pronouns: "she/her",
        };
        const responseResult = await adminAuthSession
            .patch("/account/" + testUserId)
            .send(updatedUserData);
        expect(responseResult.body.message).toHaveProperty("pronouns", "she/her");
    });
});

describe("Signed in as admin PostsController routes work and accept/return data correctly", () => {

    // CREATE
    test("POST request.body of newPostData returns newPostData", async () => {
        let newPostData = {
            "title": "new post",
            "caption": "new post caption",
            "body": "new post body",
            "photo": "testimage.com"
        };
        const responseResult = await adminAuthSession.post("/posts").send(newPostData);

        testPostId = responseResult.body._id;
        testPostAuthor = responseResult.body.author;

        expect(responseResult.body).toHaveProperty("title", newPostData.title);
        expect(responseResult.body).toHaveProperty("caption", newPostData.caption);
        expect(responseResult.body).toHaveProperty("body", newPostData.body);
        expect(responseResult.body).toHaveProperty("photo", newPostData.photo)
        expect(responseResult.body).toHaveProperty("_id", testPostId);
    });

    // READ
    test("GET 'posts/testPostId' route exists and returns testPostId's data", async () => {
        const responseResult = await request(app).get("/posts/" + testPostId);

        expect(responseResult.body).toHaveProperty("title", "new post");
        expect(responseResult.body).toHaveProperty("caption", "new post caption");
        expect(responseResult.body).toHaveProperty("body", "new post body");
        expect(responseResult.body).toHaveProperty("photo", "testimage.com");
        expect(responseResult.body).toHaveProperty("_id", testPostId);
    });
    // test("GET 'posts' route exists and returns all posts", async () => {
    //     const responseResult = await request(app).get("/posts/");

    //     expect(responseResult.body).toHaveProperty("title", "new post");
    //     expect(responseResult.body).toHaveProperty("caption", "new post caption");
    //     expect(responseResult.body).toHaveProperty("body", "new post body");
    //     expect(responseResult.body).toHaveProperty("photo", "testimage.com");
    //     expect(responseResult.body).toHaveProperty("_id", testPostId);
    // });

    //UPDATE
    test("PATCH request.body of updatedPostData returns userData with updates", async () => {
        let updatedPostData = {
            "title": "update new title"
        };
        const responseResult = await adminAuthSession
            .patch("/posts/" + testPostId + "/" + testPostAuthor)
            .send(updatedPostData);

        expect(responseResult.body).toHaveProperty("title", "update new title");
    });

    // DELETE
    test("DELETE postData returns success message", async () => {
        const responseResult = await adminAuthSession.delete("/posts/" + testPostId + "/" + testPostAuthor);

        expect(responseResult.body.message).toEqual("Post is successfully deleted");
    });
    test("DELETE postData returns success message", async () => {
        const responseResult = await adminAuthSession.delete("/posts/123456/1234");

        expect(responseResult.body.message).toEqual("Post is successfully deleted");
    });
});

// THESE TESTS MUST GO LAST --> adminAuthSession relies on these accounts
describe("Admin delete routes work for other users, and for self", () => {
    // DELETE

    test("Admin DELETE userData returns message with username", async () => {
        const responseResult = await adminAuthSession.delete("/account/" + testUserId);
        expect(responseResult.body.message).toEqual("deleting user: User4");
    });
    test("DELETE admin userData returns message with username", async () => {
        const responseResult = await adminAuthSession.delete("/account/");
        expect(responseResult.body.message).toEqual("deleting user: Admin2");
    });

});
