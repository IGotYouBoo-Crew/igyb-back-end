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
const { Comment } = require("../../src/models/CommentModel");
const { Event } = require("../../src/models/EventModel");

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


// Tests for USERS, who are admins:

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
    test("Admin GET '/:username' route passes", async () => {
        let responseData = await adminAuthSession.get("/account/User4");
        expect(responseData.status).toEqual(200)
    });

    // UPDATE
    test("Admin PATCH request of another user returns updated userData", async () => {
        let updatedUserData = {
            pronouns: "she/her",
        };
        const responseResult = await adminAuthSession
            .patch("/account/" + testUserId + "/true")
            .send(updatedUserData);
        expect(responseResult.body.message).toHaveProperty("pronouns", "she/her");
    });
});


// Tests for POSTS, for logged in Admin users:

describe("Signed in as admin PostsController routes work and accept/return data correctly", () => {

    // CREATE
    test("POST request.body of adminPostData returns adminPostData", async () => {
        let adminPostData = {
            "title": "New Admin Post",
            "caption": "New admin post caption",
            "body": "New admin post body",
            "photo": "testimage.com"
        };
        const responseResult = await adminAuthSession.post("/posts").send(adminPostData);

        adminTestPostId = responseResult.body._id;
        adminTestPostAuthor = responseResult.body.author;

        expect(responseResult.body).toHaveProperty("title", adminPostData.title);
        expect(responseResult.body).toHaveProperty("caption", adminPostData.caption);
        expect(responseResult.body).toHaveProperty("body", adminPostData.body);
        expect(responseResult.body).toHaveProperty("photo", adminPostData.photo);
        expect(responseResult.body).toHaveProperty("_id", adminTestPostId);
        expect(responseResult.body).toHaveProperty("date");
    });

    // READ
    test("GET '/posts/adminTestPostId' route exists and returns adminTestPostId's data", async () => {
        const responseResult = await request(app).get("/posts/" + adminTestPostId);

        expect(responseResult.body).toHaveProperty("title", "New Admin Post");
        expect(responseResult.body).toHaveProperty("caption", "New admin post caption");
        expect(responseResult.body).toHaveProperty("body", "New admin post body");
        expect(responseResult.body).toHaveProperty("photo", "testimage.com");
        expect(responseResult.body).toHaveProperty("_id", adminTestPostId);
        expect(responseResult.body).toHaveProperty("date");
    });
    test("GET '/posts/' route exists and returns all posts", async () => {
        const responseResult = await request(app).get("/posts/");

        expect(responseResult.statusCode).toEqual(200);
        expect(responseResult.body.length > 0).toEqual(true);
    });

    //UPDATE
    test("PATCH request.body of updatedAdminPostData returns adminPostData with updates", async () => {
        let updatedAdminPostData = {
            "title": "Updated Admin Title"
        };
        const responseResult = await adminAuthSession
            .patch("/posts/" + adminTestPostId + "/" + adminTestPostAuthor)
            .send(updatedAdminPostData);

        expect(responseResult.body).toHaveProperty("title", "Updated Admin Title");
    });

    // DELETE
    test("DELETE adminPostData returns success message", async () => {
        const responseResult = await adminAuthSession.delete("/posts/" + adminTestPostId + "/" + adminTestPostAuthor);

        expect(responseResult.body.message).toEqual("Post: Updated Admin Title has been successfully deleted");

    });
    test("DELETE adminPostData returns success message for post that wasn't created by the user", async () => {
        const seededTestPost = await Post.findOne({title: "first seeded post"}).exec();
        const responseResult = await adminAuthSession.delete("/posts/" + seededTestPost._id + "/" + seededTestPost.author);

        expect(responseResult.body.message).toEqual("Post: first seeded post has been successfully deleted");
    });
});


// Tests for COMMENTS, for logged in Admin users:

describe("Signed in as admin CommentsController routes work and accept/return data correctly", () => {

    // CREATE
    test("POST request.body of adminCommentData returns adminCommentData", async () => {
        const seededTestPost = await Post.findOne({title: "second seeded post"}).exec();
        let adminCommentData = {
            desc: "New Admin Comment",
            parentPostId: seededTestPost._id,
        };
        const responseResult = await adminAuthSession.post("/comments").send(adminCommentData);

        adminTestCommentId = responseResult.body._id;
        adminTestCommentAuthor = responseResult.body.author;

        expect(responseResult.body).toHaveProperty("desc", adminCommentData.desc);
        expect(responseResult.body).toHaveProperty("parentPostId");
        expect(responseResult.body).toHaveProperty("date");
        expect(responseResult.body).toHaveProperty("_id", adminTestCommentId);

    });

    //UPDATE
    test("PATCH request.body of updatedAdminCommentData returns adminCommentData with updates", async () => {
        let updatedAdminCommentData = {
            "desc": "updated admin comment desc"
        };
        const responseResult = await adminAuthSession
            .patch("/comments/" + adminTestCommentId + "/" + adminTestCommentAuthor)
            .send(updatedAdminCommentData);

        expect(responseResult.body).toHaveProperty("desc", "updated admin comment desc");
    });

    // DELETE
    test("DELETE adminCommentData returns success message", async () => {
        const responseResult = await adminAuthSession.delete("/comments/" + adminTestCommentId + "/" + adminTestCommentAuthor);

        expect(responseResult.body.message).toEqual(`Comment: ${adminTestCommentId} has been successfully deleted`);
    });
    test("DELETE commentData returns success message for comment that wasn't created by the user", async () => {
        const seededTestComment = await Comment.findOne({desc: "first seeded comment"}).exec();
        const responseResult = await adminAuthSession.delete("/comments/" + seededTestComment._id + "/" + seededTestComment.author);

        expect(responseResult.body.message).toEqual(`Comment: ${seededTestComment._id} has been successfully deleted`);
    });
});


// Tests for EVENTS, for logged in Admin users:

describe("Signed in as admin EventsController routes work and accept/return data correctly", () => {

    // CREATE
    test("POST request.body of newEventData returns newEventData", async () => {
        let newEventData = {
            title: "Hot Potato Test Event",
            host: "Boiled Potato",
            image: "https://t4.ftcdn.net/jpg/03/43/50/71/360_F_343507119_ZEc4MsKNcqhPpCQlk5SZ3KEZmUz4d8u2.jpg",
            date: "Dec 31, 2023",
            start: "12:00",
            finish: "15:00",
            ticketLink: "https://potatofestival.com.au/whats-on/activities/",
            content: "I'm trying to create a test event and I'm a potato"
        };
        const responseResult = await adminAuthSession.post("/events/").send(newEventData);

        testEventId = responseResult.body._id;
        testEventAuthor = responseResult.body.author;

        expect(responseResult.body).toHaveProperty("title", newEventData.title);
        expect(responseResult.body).toHaveProperty("host", newEventData.host);
        expect(responseResult.body).toHaveProperty("image", newEventData.image)
        expect(responseResult.body).toHaveProperty("date", "Dec 31, 2023");
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

        expect(responseResult.body).toHaveProperty("title", "Hot Potato Test Event");
        expect(responseResult.body).toHaveProperty("host", "Boiled Potato");
        expect(responseResult.body).toHaveProperty("image", "https://t4.ftcdn.net/jpg/03/43/50/71/360_F_343507119_ZEc4MsKNcqhPpCQlk5SZ3KEZmUz4d8u2.jpg");
        expect(responseResult.body).toHaveProperty("date", "Dec 31, 2023");
        expect(responseResult.body).toHaveProperty("start", "12:00");
        expect(responseResult.body).toHaveProperty("finish", "15:00");
        expect(responseResult.body).toHaveProperty("ticketLink", "https://potatofestival.com.au/whats-on/activities/");
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
