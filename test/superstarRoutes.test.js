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

var testSession = session(app);
var authenticatedSession;

let loginDetails = {
    username: "User4",
    password: "fakepassword",
};

beforeEach(async () => {
    server = app.listen(3030, async () => {
        await databaseConnect();
    });
    // This (attempts to) sign-in as User4 before each test is run
    await testSession.post("/account/signIn").send(loginDetails);
    // If the test uses authenticatedSession, then it will use the signed-in session (with cookie)
    authenticatedSession = testSession;
});

afterEach(() => {
    server.close();
});

afterAll(() => {
    mongoose.disconnect();
});

describe("Signed in UserController routes work and accept/return data correctly", () => {
    // CREATE
    // This test uses request(app) and not authenticatedSession because is used to create the user that we sign in as
    // the authenticatedSession at this point is actually a 404 lol
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

    // this test is run to get the userOneId --> used to test updating another user's account
    test("'account/user1' route exists and returns user1's data", async () => {
        const responseResult = await request(app).get("/account/user1");
        expect(responseResult.body.data).toHaveProperty("username", "user1");
        expect(responseResult.body.data).toHaveProperty("_id");
        // global variable used later
        userOneId = responseResult.body.data._id;
    });

    // UPDATE
    test("PATCH request.body of updatedUserData fails if user is not OP or Admin", async () => {
        let updatedUserData = {
            pronouns: "she/her",
        };
        // authenticatedSession used to test signed-in attempt
        // Here, we expect it to fail again, but for different reasons
        let testResponse = await authenticatedSession
            .patch("/account/" + userOneId)
            .send(updatedUserData);
        expect(testResponse.body).toHaveProperty(
            "errors",
            "Error: You are not authorised to access this route"
        );
    });

    test("PATCH request.body of updatedUserData returns userData with updates if OP", async () => {
        let updatedUserData = {
            pronouns: "she/her",
        };
        const responseResult = await authenticatedSession
            .patch("/account/" + testUserId)
            .send(updatedUserData);
        expect(responseResult.body.message).toHaveProperty("pronouns", "she/her");
    });

    test("signout route signs out user", async () => {
        const checkProtectedRoute = await authenticatedSession.post(
            "/account/someOtherProtectedRoute"
        );
        expect(checkProtectedRoute.statusCode).toEqual(200);
        await authenticatedSession.post("/account/signOut");
        const failProtectedRoute = await authenticatedSession.post(
            "/account/someOtherProtectedRoute"
        );
        expect(failProtectedRoute.statusCode).toEqual(401);
    });
});

describe("Signed in user PostsController routes work and accept/return data correctly", () => {
    // CREATE
    test("POST request.body of newPostData returns newPostData", async () => {
        let newPostData = {
            "title": "new post",
            "caption": "new post caption",
            "body": "new post body",
            "photo": "testimage.com"
        };
        const responseResult = await authenticatedSession.post("/posts").send(newPostData);

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

    // UPDATE
    test("PATCH request.body of updatedPostData returns postData with updates", async () => {

        let updatedPostData = {
            "title": "update new title"
        };
        const responseResult = await authenticatedSession
            .patch("/posts/" + testPostId + "/" + testPostAuthor)
            .send(updatedPostData);

        expect(responseResult.body).toHaveProperty("title", "update new title");
    });
    test("PATCH request.body of updatedPostData returns error message as user is unauthorised", async () => {
        let updatedPostData = {
            "title": "update new title"
        };
        const responseResult = await authenticatedSession
            .patch("/posts/" + "/12345" + "/123")
            .send(updatedPostData);

            expect(responseResult.body.errors).toEqual("Error: You are not authorised to access this route")
    });

    // DELETE
    test("DELETE postData returns message with username", async () => {
        const responseResult = await authenticatedSession.delete(
            "/posts/" + testPostId + "/" + testPostAuthor
        );

        expect(responseResult.body.message).toEqual("Post: update new title has been successfully deleted");
    });

    // DELETE
    test("DELETE postData returns error message as user is unauthorised", async () => {
        const responseResult = await authenticatedSession.delete("/posts/123456/1234");

        expect(responseResult.body.errors).toEqual(
            "Error: You are not authorised to access this route"
        );
    });
});

describe("Signed in as superstar CommentsController routes work and accept/return data correctly", () => {

    // CREATE
    test("POST request.body of newCommentData returns newCommentData", async () => {
        const testPost = await Post.findOne({title: "second post"}).exec();
        let newCommentData = {
            desc: "New Comment",
            parentPostId: testPost._id,
        };
        const responseResult = await authenticatedSession.post("/comments").send(newCommentData);

        testCommentId = responseResult.body._id;
        testCommentAuthor = responseResult.body.author;

        expect(responseResult.body).toHaveProperty("desc", newCommentData.desc);
        expect(responseResult.body).toHaveProperty("parentPostId");
        expect(responseResult.body).toHaveProperty("_id", testCommentId);

    });

    //UPDATE
    test("PATCH request.body of updatedCommentData returns commentData with updates", async () => {
        let updatedCommentData = {
            "desc": "updated comment description admin"
        };
        const responseResult = await authenticatedSession
            .patch("/comments/" + testCommentId + "/" + testCommentAuthor)
            .send(updatedCommentData);

        expect(responseResult.body).toHaveProperty("desc", "updated comment description admin");
    });
    test("PATCH request.body of updatedCommentData returns commentData with updates", async () => {
        let updatedCommentData = {
            "desc": "updated comment description admin"
        };
        const responseResult = await authenticatedSession
            .patch("/comments/" + "/12345" + "/123")
            .send(updatedCommentData);

            expect(responseResult.body.errors).toEqual("Error: You are not authorised to access this route")
    });

    // DELETE
    test("DELETE commentData returns success message", async () => {
        const responseResult = await authenticatedSession.delete("/comments/" + testCommentId + "/" + testCommentAuthor);

        expect(responseResult.body.message).toEqual(`Comment: ${testCommentId} has been successfully deleted`);
    });
    test("DELETE commentData returns success message", async () => {
        const testComment = await Comment.findOne({desc: "first comment"}).exec();
        const responseResult = await authenticatedSession.delete("/comments/" + testComment._id + "/" + testComment.author);

        expect(responseResult.body.errors).toEqual(
            "Error: You are not authorised to access this route"
        );
    });
});


// Tests for EVENTS, for logged in Superstar users:

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
        const responseResult = await authenticatedSession.post("/events/").send(newEventData);

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

    // UPDATE
    test("PATCH request.body of updatedEventData returns eventData with updates", async () => {
        let updatedEventData = {
            "host": "Dauphinoise Potato"
        };
        const responseResult = await authenticatedSession
            .patch("/events/" + testEventId + "/" + testEventAuthor)
            .send(updatedEventData);

        expect(responseResult.body).toHaveProperty("host", "Dauphinoise Potato");
    });

    test("PATCH request.body of updatedEventData returns userData with updates", async () => {
        let updatedEventData = {
            "host": "Scalloped Potato"
        };
        const responseResult = await authenticatedSession
            .patch("/events/" + "12345/" + "CaptainNaomi")
            .send(updatedEventData);

            expect(responseResult.body.errors).toEqual("Error: You are not authorised to access this route")
    });

    // DELETE event created by this Superstar
    test("DELETE eventData returns message with username", async () => {
        const responseResult = await authenticatedSession.delete(
            "/events/" + testEventId + "/" + testEventAuthor
        );

        expect(responseResult.body.message).toEqual("Event: Hot Potato Test Event is successfully deleted");
    });

    // DELETE event created by someone else
    test("DELETE returns error message as user is unauthorised", async () => {
        const responseResult = await authenticatedSession.delete("/events/12345/CaptainNaomi");

        expect(responseResult.body.errors).toEqual(
            "Error: You are not authorised to access this route"
        );
    });
});


// THIS TEST MUST GO LAST --> authenticatedSession is reliant on this account
describe("User can delete account", () => {
    // DELETE
    test("DELETE route works for self-deletion", async () => {
        const responseResult = await authenticatedSession.delete("/account/");
        expect(responseResult.body.message).toEqual("deleting user: User4");
    });
});
