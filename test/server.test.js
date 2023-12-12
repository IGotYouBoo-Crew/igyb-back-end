// Test the routes from server.js
const { databaseConnect } = require("../src/database");
const { app } = require("../src/server");
// Import supertest so we can manage the app/server in tests properly
const request = require("supertest");


beforeAll(async () => {
    server = app.listen(3030, async () => {
        await databaseConnect();
        console.log(`
        I Got You Boo API is now running!
        
        Congrats!
        `);
    });
});

afterAll(() => {
    server.close();
});

describe("server root route exists and returns status hello world", () => {
    test("root route exists and returns status 200", async () => {
        const responseResult = await request(app).get("/");
        expect(responseResult.statusCode).toEqual(200);
    });

    test("root route exists and returns hello world message", async () => {
        const responseResult = await request(app).get("/");
        expect(responseResult.body.message).toEqual("Hello world!");
    });
    test("gets database details", async () => {
        const responseResult = await request(app).get("/databaseHealth");
        console.log(responseResult)
        expect(responseResult.body).toHaveProperty("databaseName");
    });
});

describe("UserController routes work and accept/return data correctly", () => {
    // CREATE
    test("POST request.body of newUserData returns newUserData", async () => {
        let newUserData = {
            "email": "postedUser@email.com",
            "password": "fakepassword",
            "username": "User4",
            "pronouns": "he/him",
        };
        
        const responseResult = await request(app).post("/account/newUser").send(newUserData);
        console.log(responseResult)
        testUserId = responseResult.body.data._id

        expect(responseResult.body.data).toHaveProperty("email", newUserData.email);
        expect(responseResult.body.data).toHaveProperty("password", newUserData.password);
        expect(responseResult.body.data).toHaveProperty("username", newUserData.username);
        expect(responseResult.body.data).toHaveProperty("pronouns", newUserData.pronouns);
        expect(responseResult.body.data).toHaveProperty("_id", testUserId);
    });
    // READ
    test("'account/user1' route exists and returns user1's data", async () => {
        const responseResult = await request(app).get("/account/user1");
        
        expect(responseResult.body.data).toHaveProperty("email", "user1@email.com");
        expect(responseResult.body.data).toHaveProperty("username", "user1");
        expect(responseResult.body.data).toHaveProperty("pronouns", "fake/data");
        expect(responseResult.body.data).toHaveProperty("_id");
        expect(responseResult.body.data).toHaveProperty("role");
    });
    // UPDATE
    test("PATCH request.body of updatedUserData returns userData with updates", async () => {
        let updatedUserData = {
            "pronouns": "she/her"
        }

        const responseResult = await request(app).patch("/account/" + testUserId).send(updatedUserData)
        
        expect(responseResult.body.message).toHaveProperty("pronouns", "she/her")
    })
    // DELETE
    test("DELETE userData returns message with username", async () => {
        const responseResult = await request(app).delete("/account/" + testUserId)
        
        expect(responseResult.body.message).toEqual("deleting user: User4")
    })

});

describe("PostsController routes work and accept/return data correctly", () => {
    // CREATE
    test("POST request.body of newPostData returns newPostData", async () => {
        let newPostData = {
            "title": "NewPost",
            "content": "Oh boy, I loooove content"
        };
        const responseResult = await request(app).post("/posts/newPost").send(newPostData);
        testPostId = responseResult.body.data._id

        expect(responseResult.body.data).toHaveProperty("title", newPostData.title);
        expect(responseResult.body.data).toHaveProperty("content", newPostData.content);
        expect(responseResult.body.data).toHaveProperty("_id", testPostId);
    });
    // READ
    test("GET 'posts/testPostId' route exists and returns testPostId's data", async () => {
        const responseResult = await request(app).get("/posts/" + testPostId);
        
        expect(responseResult.body.data).toHaveProperty("title", "NewPost");
        expect(responseResult.body.data).toHaveProperty("content", "Oh boy, I loooove content");
        expect(responseResult.body.data).toHaveProperty("_id", testPostId);
    });
    // UPDATE
    test("PATCH request.body of updatedPostData returns userData with updates", async () => {
        let updatedPostData = {
            "content": "update: I hate content"
        }
        const responseResult = await request(app).patch("/posts/" + testPostId).send(updatedPostData)
        
        expect(responseResult.body.message).toHaveProperty("content", "update: I hate content")
    })
    // DELETE
    test("DELETE userData returns message with username", async () => {
        const responseResult = await request(app).delete("/posts/" + testPostId)
        
        expect(responseResult.body.message).toEqual("deleting post: NewPost")
    })
});
describe("EventsController routes work and accept/return data correctly", () => {
    // CREATE
    test("POST request.body of newEventData returns newEventData", async () => {
        let newEventData = {
            "title": "NewEvent",
            "content": "Oh boy, I loooove events"
        };
        const responseResult = await request(app).post("/events/newEvent").send(newEventData);
        testEventId = responseResult.body.data._id

        expect(responseResult.body.data).toHaveProperty("title", newEventData.title);
        expect(responseResult.body.data).toHaveProperty("content", newEventData.content);
        expect(responseResult.body.data).toHaveProperty("_id", testEventId);
    });
    // READ
    test("GET 'events/testEventId' route exists and returns testEventId's data", async () => {
        const responseResult = await request(app).get("/events/" + testEventId);
        
        expect(responseResult.body.data).toHaveProperty("title", "NewEvent");
        expect(responseResult.body.data).toHaveProperty("content", "Oh boy, I loooove events");
        expect(responseResult.body.data).toHaveProperty("_id", testEventId);
    });
    // UPDATE
    test("PATCH request.body of updatedEventData returns eventData with updates", async () => {
        let updatedEventData = {
            "content": "update: I hate events"
        }
        const responseResult = await request(app).patch("/events/" + testEventId).send(updatedEventData)
        
        expect(responseResult.body.message).toHaveProperty("content", "update: I hate events")
    })
    // DELETE
    test("DELETE event returns message with event title", async () => {
        const responseResult = await request(app).delete("/events/" + testEventId)
        
        expect(responseResult.body.message).toEqual("deleting event: NewEvent")
    })
});
