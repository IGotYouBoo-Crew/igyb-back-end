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

// Tests for USERS, who are Superstars:

describe("Signed in UserController routes work and accept/return data correctly", () => {
    // CREATE
    // This test uses request(app) and not authenticatedSession because is used to create the user that we sign in as
    // the authenticatedSession at this point is actually a 404 lol
    test("POST request.body of newUserData returns username and role", async () => {
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
    test("POST request.body of newUserData returns username and role", async () => {
        let newUserData = {
            email: "postedUser6@email.com",
            password: "fakepassword",
            username: "User6",
            pronouns: "he/him",
        };

        const responseResult = await request(app).post("/account/newUser").send(newUserData);
        const responseData = responseResult.body.data;
        // global variable used to access same document later for Update and Delete actions
        errorTestUserId = responseData._id;
        expect(responseResult.statusCode).toEqual(200)
    });

    // READ
    // this test is run to get the userOneId --> used to test updating another user's account
    test("'account/user1' route exists and returns error", async () => {
        const responseResult = await request(app).get("/account/user1");
        console.log(responseResult.body)
        expect(responseResult.body.errors).toEqual('Error: User not signed in')
    });

    // UPDATE
    test("PATCH request.body of updatedUserData fails if user is not OP or Admin", async () => {
        let updatedUserData = {
            pronouns: "she/her",
        };
        // authenticatedSession used to test signed-in attempt
        // Here, we expect it to fail again, but for different reasons
        let testResponse = await authenticatedSession
            .patch("/account/" + errorTestUserId + "/false")
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
            .patch("/account/" + testUserId + "/false")
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


// Tests for POSTS, for logged in Superstar users:

describe("Signed in user PostsController routes work and accept/return data correctly", () => {
    
    // CREATE
    test("POST request.body of superstarPostData returns newPostData", async () => {
        let superstarPostData = {
            "title": "New Superstar Post",
            "caption": "new superstar post caption",
            "body": "new superstar post body",
            "photo": "testimage.com"
        };
        const responseResult = await authenticatedSession.post("/posts").send(superstarPostData);

        superstarTestPostId = responseResult.body._id;
        superstarTestPostAuthor = responseResult.body.author;

        expect(responseResult.body).toHaveProperty("title", superstarPostData.title);
        expect(responseResult.body).toHaveProperty("caption", superstarPostData.caption);
        expect(responseResult.body).toHaveProperty("body", superstarPostData.body);
        expect(responseResult.body).toHaveProperty("photo", superstarPostData.photo);
        expect(responseResult.body).toHaveProperty("date");
        expect(responseResult.body).toHaveProperty("_id", superstarTestPostId);
    });
    
    // READ
    test("GET '/posts/superstarTestPostId' route exists and returns superstarTestPostId's data", async () => {
        const responseResult = await request(app).get("/posts/" + superstarTestPostId);

        expect(responseResult.body).toHaveProperty("title", "New Superstar Post");
        expect(responseResult.body).toHaveProperty("caption", "new superstar post caption");
        expect(responseResult.body).toHaveProperty("body", "new superstar post body");
        expect(responseResult.body).toHaveProperty("photo", "testimage.com");
        expect(responseResult.body).toHaveProperty("date");
        expect(responseResult.body).toHaveProperty("_id", superstarTestPostId);
    });
    test("GET '/posts/' route exists and returns all posts", async () => {
        const responseResult = await request(app).get("/posts/");

        expect(responseResult.statusCode).toEqual(200);
        expect(responseResult.body.length > 0).toEqual(true);
    });

    // UPDATE
    test("PATCH request.body of updatedSuperstarPostData returns superstarPostData with updates", async () => {

        let updatedSuperstarPostData = {
            "title": "updated superstar post title"
        };
        const responseResult = await authenticatedSession
            .patch("/posts/" + superstarTestPostId + "/" + superstarTestPostAuthor)
            .send(updatedSuperstarPostData);

        expect(responseResult.body).toHaveProperty("title", "updated superstar post title");
    });
    test("PATCH request.body of updatedSuperstarPostData returns error message as user is unauthorised", async () => {
        let updatedSuperstarPostData = {
            "title": "updated superstar post title - non-owner"
        };
        const responseResult = await authenticatedSession
            .patch("/posts/" + "/12345" + "/123")
            .send(updatedSuperstarPostData);

            expect(responseResult.body.errors).toEqual("Error: You are not authorised to access this route")
    });

    // DELETE
    test("DELETE superstarPostData returns success message", async () => {
        const responseResult = await authenticatedSession.delete(
            "/posts/" + superstarTestPostId + "/" + superstarTestPostAuthor
        );

        expect(responseResult.body.message).toEqual("Post: updated superstar post title has been successfully deleted");
    });

    // DELETE
    test("DELETE superstarPostData returns error message as user is unauthorised", async () => {
        const responseResult = await authenticatedSession.delete("/posts/123456/1234");

        expect(responseResult.body.errors).toEqual(
            "Error: You are not authorised to access this route"
        );
    });
});


// Tests for COMMENTS, for logged in Superstar users:

describe("Signed in as superstar CommentsController routes work and accept/return data correctly", () => {

    // CREATE
    test("POST request.body of superstarCommentData returns superstarCommentData", async () => {
        const seededTestPost = await Post.findOne({title: "second seeded post"}).exec();
        let superstarCommentData = {
            desc: "New Superstar Comment",
            parentPostId: seededTestPost._id,
        };
        const responseResult = await authenticatedSession.post("/comments").send(superstarCommentData);

        superstarTestCommentId = responseResult.body._id;
        superstarTestCommentAuthor = responseResult.body.author;

        expect(responseResult.body).toHaveProperty("desc", superstarCommentData.desc);
        expect(responseResult.body).toHaveProperty("parentPostId");
        expect(responseResult.body).toHaveProperty("date");
        expect(responseResult.body).toHaveProperty("_id", superstarTestCommentId);

    });

    //UPDATE
    test("PATCH request.body of updatedCommentData returns commentData with updates", async () => {
        let updatedSuperstarCommentData = {
            "desc": "updated superstar comment desc"
        };
        const responseResult = await authenticatedSession
            .patch("/comments/" + superstarTestCommentId + "/" + superstarTestCommentAuthor)
            .send(updatedSuperstarCommentData);

        expect(responseResult.body).toHaveProperty("desc", "updated superstar comment desc");
    });
    test("PATCH request.body of updatedSuperstarCommentData returns error message as user is not authorised", async () => {
        let updatedSuperstarCommentData = {
            "desc": "updated comment description admin"
        };
        const responseResult = await authenticatedSession
            .patch("/comments/" + "/12345" + "/123")
            .send(updatedSuperstarCommentData);

            expect(responseResult.body.errors).toEqual("Error: You are not authorised to access this route")
    });

    // DELETE
    test("DELETE superstarCommentData returns success message", async () => {
        const responseResult = await authenticatedSession.delete("/comments/" + superstarTestCommentId + "/" + superstarTestCommentAuthor);

        expect(responseResult.body.message).toEqual(`Comment: ${superstarTestCommentId} has been successfully deleted`);
    });
    test("DELETE superstarCommentData returns error message as user is unauthorised", async () => {
        const seededTestComment = await Comment.findOne({desc: "first seeded comment"}).exec();
        const responseResult = await authenticatedSession.delete("/comments/" + seededTestComment._id + "/" + seededTestComment.author);

        expect(responseResult.body.errors).toEqual(
            "Error: You are not authorised to access this route"
        );
    });
});


// Tests for EVENTS, for logged in Superstar users:

describe("Signed in as superstar EventsController routes work and accept/return data correctly", () => {
    
    // CREATE
    test("POST request.body of newEventData returns newEventData", async () => {
        let newEventData = {
            title: "Hot Potato Test Event",
            host: "Boiled Potato",
            image: "https://t4.ftcdn.net/jpg/03/43/50/71/360_F_343507119_ZEc4MsKNcqhPpCQlk5SZ3KEZmUz4d8u2.jpg",
            date: "Dec 31, 2023",
            start: "12:00",
            finish: "15:00",
            ticketLink: "https://thewiggles.com/live",
            content: "I'm trying to create a test event and I'm a potato"
        };
        const responseResult = await authenticatedSession.post("/events/").send(newEventData);

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
