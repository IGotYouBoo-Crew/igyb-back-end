// Test the routes from server.js
const { default: mongoose } = require("mongoose");
const { databaseConnect } = require("../../src/database");
const { app } = require("../../src/server");
let bcrypt = require("bcrypt");
// Import supertest so we can manage the app/server in tests properly
const request = require("supertest");
const { getRoleIdByName } = require("../../src/controllers/functions/RoleFunctions");
var session = require("supertest-session");
const { Post } = require("../../src/models/PostModel");

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
        expect(responseResult.body).toHaveProperty("dbModels");
    });
});

describe("UserController routes work and accept/return data correctly", () => {
    // CREATE
    test("POST request.body of newUserData returns newUserData and JWT", async () => {
        let newUserData = {
            email: "testUser5@email.com",
            password: "fakepassword",
            username: "User5",
            pronouns: "she/her",
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
    test("Guests cannot access protected routes", async () => {
        const responseResult = await request(app).post("/account/someOtherProtectedRoute");
        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

    // DELETE
    test("DELETE userData fails for guest", async () => {
        const responseResult = await request(app).delete("/account/" + testUserId);
        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });
});

describe("PostsController routes work and reject non users", () => {
    
    // CREATE
    test("POST request.body of newPostData returns error message", async () => {
        let newPostData = {
            title: "NewPost",
            content: "Oh boy, I loooove content",
        };
        const responseResult = await request(app).post("/posts").send(newPostData);

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

    // // READ
    // test("GET 'posts/testPostId' route exists and returns testPostId's data", async () => {
    //     const testPost = await Post.findOne({title: "first post"});
    //     console.log(testPost)
    //     const responseResult = await request(app).get("/posts/" + testPost._id);

    //     expect(responseResult.body).toHaveProperty("title", "first post");
    //     expect(responseResult.body).toHaveProperty("caption", "new post caption");
    //     expect(responseResult.body).toHaveProperty("body", "post 1 body...");
    //     expect(responseResult.body).toHaveProperty("photo", "https://images.app.goo.gl/nBRuxwm7mfhvN1Hj6");
    //     expect(responseResult.body).toHaveProperty("_id", testPost._id);
    // });

    // // READ
    // test("GET 'posts' route exists and returns all posts", async () => {
    //     const responseResult = await request(app).get("/posts/");

    //     expect(responseResult.body).toHaveProperty("title", "new post");
    //     expect(responseResult.body).toHaveProperty("caption", "new post caption");
    //     expect(responseResult.body).toHaveProperty("body", "new post body");
    //     expect(responseResult.body).toHaveProperty("photo", "testimage.com");
    //     expect(responseResult.body).toHaveProperty("_id", testPostId);
    // });

    // UPDATE

    test("PATCH request.body of updatedPostData returns error message", async () => {
        let updatedPostData = {
            content: "update: I hate content",
        };
        const responseResult = await request(app)
            .patch("/posts/123456/1234")
            .send(updatedPostData);

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

    // DELETE
    test("DELETE userData returns error 'user not signed in'", async () => {

        const responseResult = await request(app).delete("/posts/123456/1234");

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

});
