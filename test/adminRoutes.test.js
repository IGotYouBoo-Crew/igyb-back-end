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
const { Comment } = require("../src/models/CommentModel");
const { Event } = require("../src/models/EventModel");

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
    test("GET 'posts' route exists and returns all posts", async () => {
        const responseResult = await request(app).get("/posts/");

        expect(responseResult.statusCode).toEqual(200);
        expect(responseResult.body.length > 0).toEqual(true);
    });

    //UPDATE
    test("PATCH request.body of updatedPostData returns postData with updates", async () => {
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

        expect(responseResult.body.message).toEqual("Post: update new title has been successfully deleted");

    });
    test("DELETE postData returns success message", async () => {
        const testPost = await Post.findOne({title: "first post"}).exec();
        const responseResult = await adminAuthSession.delete("/posts/" + testPost._id + "/" + testPost.author);

        expect(responseResult.body.message).toEqual("Post: first post has been successfully deleted");
    });
});

describe("Signed in as admin CommentsController routes work and accept/return data correctly", () => {

    // CREATE
    test("POST request.body of newCommentData returns newCommentData", async () => {
        const testPost = await Post.findOne({title: "second post"}).exec();
        let newCommentData = {
            desc: "New Comment",
            parentPostId: testPost._id,
        };
        const responseResult = await adminAuthSession.post("/comments").send(newCommentData);

        testCommentId = responseResult.body._id;
        testCommentAuthor = responseResult.body.author;

        expect(responseResult.body).toHaveProperty("desc", newCommentData.desc);
        expect(responseResult.body).toHaveProperty("parentPostId");
        expect(responseResult.body).toHaveProperty("_id", testCommentId);

    });

    //UPDATE
    test("PATCH request.body of updatedCommentData returns CommentData with updates", async () => {
        let updatedCommentData = {
            "desc": "updated comment description admin"
        };
        const responseResult = await adminAuthSession
            .patch("/comments/" + testCommentId + "/" + testCommentAuthor)
            .send(updatedCommentData);

        expect(responseResult.body).toHaveProperty("desc", "updated comment description admin");
    });

    // DELETE
    test("DELETE commentData returns success message", async () => {
        const responseResult = await adminAuthSession.delete("/comments/" + testCommentId + "/" + testCommentAuthor);

        expect(responseResult.body.message).toEqual(`Comment: ${testCommentId} has been successfully deleted`);
    });
    test("DELETE commentData returns success message", async () => {
        const testComment = await Comment.findOne({desc: "first comment"}).exec();
        const responseResult = await adminAuthSession.delete("/comments/" + testComment._id + "/" + testComment.author);

        expect(responseResult.body.message).toEqual(`Comment: ${testComment._id} has been successfully deleted`);
    });
});


// Tests for EVENTS, for logged in Admin users:

describe("Signed in as admin EventsController routes work and accept/return data correctly", () => {

    // CREATE
    test("POST request.body of newEventData returns newEventData", async () => {
        let newEventData = {
            host: "Boiled Potato",
            image: "https://t4.ftcdn.net/jpg/03/43/50/71/360_F_343507119_ZEc4MsKNcqhPpCQlk5SZ3KEZmUz4d8u2.jpg",
            title: "Hot Potato Test Event",
            date: "2023-12-31",
            start: "12:00",
            finish: "15:00",
            ticketLink: "https://thewiggles.com/live",
            content: "I'm trying to create a test event and I'm a potato"
        };
        const responseResult = await adminAuthSession.post("/events/").send(newEventData);

        testEventId = responseResult.body._id;
        testEventAuthor = responseResult.body.author;

        expect(responseResult.body).toHaveProperty("host", newEventData.host);
        expect(responseResult.body).toHaveProperty("image", newEventData.image)
        expect(responseResult.body).toHaveProperty("title", newEventData.title);
        expect(responseResult.body).toHaveProperty("date", newEventData.date);
        expect(responseResult.body).toHaveProperty("start", newEventData.start);
        expect(responseResult.body).toHaveProperty("finish", newEventData.finish);
        expect(responseResult.body).toHaveProperty("ticketLink", newEventData.ticketLink);
        expect(responseResult.body).toHaveProperty("content", newEventData.content);
        expect(responseResult.body).toHaveProperty("_id", testEventId);
    });

    // READ
    test("GET 'events' route exists and returns all events", async () => {
        const responseResult = await request(app).get("/events/");

        expect(responseResult.statusCode).toEqual(200);
        expect(responseResult.body.length > 0).toEqual(true);
    });

    test("GET 'events/testEventId' route exists and returns testEventId's data", async () => {
        const responseResult = await request(app).get("/events/" + testEventId);

        expect(responseResult.body).toHaveProperty("host", "Boiled Potato");
        expect(responseResult.body).toHaveProperty("image", "https://t4.ftcdn.net/jpg/03/43/50/71/360_F_343507119_ZEc4MsKNcqhPpCQlk5SZ3KEZmUz4d8u2.jpg");
        expect(responseResult.body).toHaveProperty("title", "Hot Potato Test Event");
        expect(responseResult.body).toHaveProperty("date", "31-12-2023");
        expect(responseResult.body).toHaveProperty("start", "12:00");
        expect(responseResult.body).toHaveProperty("finish", "15:00");
        expect(responseResult.body).toHaveProperty("ticketLink", "https://thewiggles.com/live");
        expect(responseResult.body).toHaveProperty("content", "I'm trying to create a test event and I'm a potato");
        expect(responseResult.body).toHaveProperty("_id", testEventId);
    });

    //UPDATE
    test("PATCH request.body of updatedEventData returns eventData with updates", async () => {
        let updatedEventData = {
            "host": "Dauphinoise Potato"
        };
        const responseResult = await adminAuthSession
            .patch("/events/" + testEventId + "/" + testEventAuthor)
            .send(updatedEventData);

        expect(responseResult.body).toHaveProperty("host", "Dauphinoise Potato");
    });

    // DELETE
    test("DELETE eventData returns success message (from test event)", async () => {
        const responseResult = await adminAuthSession.delete("/events/" + testEventId + "/" + testEventAuthor);

        expect(responseResult.body.message).toEqual("Event: Hot Potato Test Event is successfully deleted");
    });

    test("DELETE eventData returns success message (from seeded event)", async () => {
        const seededEvent = await Event.findOne({title: "first seeded event"}).exec();
        const responseResult = await adminAuthSession.delete("/events/" + seededEvent._id + "/" + seededEvent.author);
        expect(responseResult.body.message).toEqual("Event: first seeded event is successfully deleted");
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
