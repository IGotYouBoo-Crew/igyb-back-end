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
const { Comment } = require("../../src/models/CommentModel")
const { Event } = require("../../src/models/EventModel");


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

// Tests for USERS, who are guests that don't yet have accounts or are not signed in:

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
            .patch("/account/" + testUserId + "/false")
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


// Tests for POSTS, with guests/users who are not logged in:

describe("PostsController routes work and reject non users", () => {
    
    // CREATE
    test("POST request.body of guestPostData returns error message", async () => {
        let guestPostData = {
            title: "New Guest Post",
            caption: "Guest post caption",
            body: "Guest post body"
        };
        const responseResult = await request(app).post("/posts").send(guestPostData);

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

    // READ
    test("GET '/posts/testPostId' route exists and returns testPostId's data", async () => {
        const seededTestPost = await Post.findOne({title: "I need advice..."}).exec();
        const responseResult = await request(app).get("/posts/" + seededTestPost._id);

        expect(responseResult.body).toHaveProperty("title", "I need advice...");
        expect(responseResult.body).toHaveProperty("caption", "Lorem ipsum dolor sit amet, consectetur adipiscing elit.");
        expect(responseResult.body).toHaveProperty("body", "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eu ex malesuada, rutrum nunc a, condimentum dui. Nulla facilisi. Donec hendrerit efficitur augue id vestibulum. Etiam maximus enim augue, nec gravida neque porta ut. In nulla mauris, euismod lacinia viverra id, sollicitudin id enim. Morbi eget dapibus purus, id cursus erat. Morbi mollis lacus non dapibus vestibulum. Etiam tincidunt erat maximus erat ultrices, in egestas nisi facilisis. Phasellus non rhoncus elit. Donec vulputate, ante vel vehicula sagittis, enim erat pharetra felis, sit amet euismod velit tortor ut lacus. Vestibulum volutpat tristique libero, non dignissim odio.");
        expect(responseResult.body).toHaveProperty("photo", "https://everydaypower.com/wp-content/uploads/2018/07/How-to-Stop-Being-Dazed-and-Confused-About-Your-Future.jpg");
        expect(responseResult.body).toHaveProperty("_id");
    });
    test("GET '/posts/' route exists and returns all posts", async () => {
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
    test("DELETE guestPostData returns error 'user not signed in'", async () => {

        const responseResult = await request(app).delete("/posts/123456/1234");

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

});


// Tests for COMMENTS, with guests/users who are not logged in:

describe("CommentsController routes work and reject non users", () => {
    
    // CREATE
    test("POST request.body of guestCommentData returns error message", async () => {
        const seededTestPost = await Post.findOne({title: "I need advice..."}).exec();
        let guestCommentData = {
            desc: "New Guest Comment",
            parentPostId: seededTestPost._id,
        };
        const responseResult = await request(app).post("/comments").send(guestCommentData);

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

    // UPDATE
    test("PATCH request.body of updatedCommentData returns error message", async () => {
        let updatedCommentData = {
            desc: "Updated guest desc.",
        };
        const responseResult = await request(app)
            .patch("/comments/123456/1234")
            .send(updatedCommentData);

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

    // DELETE
    test("DELETE guestCommentData returns error 'user not signed in'", async () => {

        const responseResult = await request(app).delete("/comments/123456/1234");

        expect(responseResult.body.errors).toEqual("Error: User not signed in");
    });

});



// Tests for EVENTS, with guests/users who are not logged in:

describe("EventsController routes work and reject non users", () => {
    
    // CREATE
    test("POST request.body of newEventData returns error message", async () => {
        let newEventData = {
            title: "Guest Potato Test Event",
            host: "Boiled Potato",
            image: "https://t4.ftcdn.net/jpg/03/43/50/71/360_F_343507119_ZEc4MsKNcqhPpCQlk5SZ3KEZmUz4d8u2.jpg",
            date: "Jun 26, 2024",
            start: "12:00",
            finish: "15:00",
            ticketLink: "https://potatofestival.com.au/whats-on/activities/",
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

        expect(responseResult.body).toHaveProperty("title", "second seeded event");
        expect(responseResult.body).toHaveProperty("host", "Queen Ella");
        expect(responseResult.body).toHaveProperty("image", "https://musicfeeds.com.au/wp-content/uploads/sites/7/2023/10/New-Project-2023-10-11T142201.049.jpg");
        expect(responseResult.body).toHaveProperty("date", "Feb 28, 2024");
        expect(responseResult.body).toHaveProperty("start", "08:00");
        expect(responseResult.body).toHaveProperty("finish", "20:00");
        expect(responseResult.body).toHaveProperty("ticketLink", "https://thewiggles.com/live");
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
