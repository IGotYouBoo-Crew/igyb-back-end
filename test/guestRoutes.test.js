// Test the routes from server.js
const { default: mongoose } = require("mongoose");
const { databaseConnect } = require("../src/database");
const { app } = require("../src/server");
let bcrypt = require("bcrypt");
// Import supertest so we can manage the app/server in tests properly
const request = require("supertest");
const { getRoleIdByName } = require("../src/controllers/functions/RoleFunctions");
var session = require("supertest-session");
const { Post } = require("../src/models/PostModel");
const { Comment } = require("../src/models/CommentModel")
const { Event } = require("../src/models/EventModel");


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
            caption: "Oh boy, I loooove content",
        };
        const responseResult = await request(app).post("/posts").send(newPostData);

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

    // READ
    test("GET 'posts/testPostId' route exists and returns testPostId's data", async () => {
        const testPost = await Post.findOne({title: "second post"}).exec();
        const responseResult = await request(app).get("/posts/" + testPost._id);

        expect(responseResult.body).toHaveProperty("title", "second post");
        expect(responseResult.body).toHaveProperty("caption", "second post caption");
        expect(responseResult.body).toHaveProperty("body", "post 2 body...");
        expect(responseResult.body).toHaveProperty("photo", "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbi6SmUiWTXz4_ve03OoxVJQ2_g7jaKxvi20DIMxsLlv5zDleZqMnfX1OaJGtpOs56UUw&usqp=CAU");
        expect(responseResult.body).toHaveProperty("_id");
    });
    test("GET 'posts' route exists and returns all posts", async () => {
        const responseResult = await request(app).get("/posts/");

        expect(responseResult.statusCode).toEqual(200);
        expect(responseResult.body.length > 0).toEqual(true);
    });

    // UPDATE

    test("PATCH request.body of updatedPostData returns error message", async () => {
        let updatedPostData = {
            caption: "update: I hate content",
        };
        const responseResult = await request(app)
            .patch("/posts/123456/1234")
            .send(updatedPostData);

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

    // DELETE
    test("DELETE postData returns error 'user not signed in'", async () => {

        const responseResult = await request(app).delete("/posts/123456/1234");

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

});

describe("CommentsController routes work and reject non users", () => {
    
    // CREATE
    test("POST request.body of newCommentData returns error message", async () => {
        const testPost = await Post.findOne({title: "second post"}).exec();
        let newCommentData = {
            desc: "New Comment",
            parentPostId: testPost._id,
        };
        const responseResult = await request(app).post("/comments").send(newCommentData);

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

    // UPDATE
    test("PATCH request.body of updatedCommentData returns error message", async () => {
        let updatedCommentData = {
            desc: "new desc",
        };
        const responseResult = await request(app)
            .patch("/comments/123456/1234")
            .send(updatedCommentData);

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

    // DELETE
    test("DELETE commentData returns error 'user not signed in'", async () => {

        const responseResult = await request(app).delete("/comments/123456/1234");

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

});



// Tests for EVENTS, with guests who are not logged in:

describe("EventsController routes work and reject non users", () => {
    
    // CREATE
    test("POST request.body of newEventData returns error message", async () => {
        let newEventData = {
            host: "Boiled Potato",
            image: "https://t4.ftcdn.net/jpg/03/43/50/71/360_F_343507119_ZEc4MsKNcqhPpCQlk5SZ3KEZmUz4d8u2.jpg",
            title: "Guest Potato Test Event",
            date: "2023-12-31",
            start: "12:00",
            finish: "15:00",
            content: "I'm trying to create a test event but I'm a potato"
        };
        const responseResult = await request(app).post("/events/").send(newEventData);

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });


    // READ
    test("GET 'events' route exists and returns all events", async () => {
        const responseResult = await request(app).get("/events/");

        expect(responseResult.statusCode).toEqual(200);
        expect(responseResult.body.length > 0).toEqual(true);
    });
    
    test("GET 'events/seededEventId' route exists and returns seededEventId's data", async () => {
        const seededEvent = await Event.findOne({title: "second seeded event"}).exec();
        const responseResult = await request(app).get("/events/" + seededEvent._id);

        expect(responseResult.body).toHaveProperty("host", "Queen Ella");
        expect(responseResult.body).toHaveProperty("image", "https://pbs.twimg.com/profile_images/1136133643900866563/TNAIerMx_400x400.jpg");
        expect(responseResult.body).toHaveProperty("title", "second seeded event");
        expect(responseResult.body).toHaveProperty("date", "28-02-2024");
        expect(responseResult.body).toHaveProperty("start", "08:00");
        expect(responseResult.body).toHaveProperty("finish", "20:00");
        expect(responseResult.body).toHaveProperty("ticketLink", "https://premier.ticketek.com.au/");
        expect(responseResult.body).toHaveProperty("content", "this is the second fake event");
        expect(responseResult.body).toHaveProperty("_id");
    });


    // UPDATE
    test("PATCH request.body of updatedEventData returns error message", async () => {
        let updatedEventData = {
            content: "false update - because I'm still a potato",
        };
        const responseResult = await request(app)
            .patch("/events/123456/potato")
            .send(updatedEventData);

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

    // DELETE
    test("DELETE eventData returns error 'user not signed in'", async () => {

        const responseResult = await request(app).delete("/events/123456/potato");

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

});
