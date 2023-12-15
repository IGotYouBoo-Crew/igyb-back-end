// Test the routes from server.js
const { default: mongoose } = require("mongoose");
const { databaseConnect } = require("../src/database");
const { app } = require("../src/server");
// Import supertest so we can manage the app/server in tests properly
const request = require("supertest");

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
        const responseResult = await request(app).get("/");
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

describe("PostsController routes work and accept/return data correctly", () => {
    // CREATE
    test("POST request.body of newPostData returns newPostData", async () => {
        let newPostData = {
            title: "NewPost",
            content: "Oh boy, I loooove content",
        };
        const responseResult = await request(app).post("/posts/newPost").send(newPostData);
        testPostId = responseResult.body.data._id;

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
            content: "update: I hate content",
        };
        const responseResult = await request(app)
            .patch("/posts/" + testPostId)
            .send(updatedPostData);

        expect(responseResult.body.message).toHaveProperty("content", "update: I hate content");
    });
    // DELETE
    test("DELETE userData returns message with username", async () => {
        const responseResult = await request(app).delete("/posts/" + testPostId);

        expect(responseResult.body.message).toEqual("deleting post: NewPost");
    });
});
describe("EventsController routes work and accept/return data correctly", () => {
    // CREATE
    test("POST request.body of newEventData returns newEventData", async () => {
        let newEventData = {
            title: "NewEvent",
            content: "Oh boy, I loooove events",
            date: "25th December 2023",
        };
        const responseResult = await request(app).post("/events/newEvent").send(newEventData);
        testEventId = responseResult.body.data._id;

        expect(responseResult.body.data).toHaveProperty("title", newEventData.title);
        expect(responseResult.body.data).toHaveProperty("content", newEventData.content);
        expect(responseResult.body.data).toHaveProperty("date", newEventData.date);
        expect(responseResult.body.data).toHaveProperty("_id", testEventId);
    });
    // READ
    test("GET 'events/testEventId' route exists and returns testEventId's data", async () => {
        const responseResult = await request(app).get("/events/" + testEventId);

        expect(responseResult.body.data).toHaveProperty("title", "NewEvent");
        expect(responseResult.body.data).toHaveProperty("content", "Oh boy, I loooove events");
        expect(responseResult.body.data).toHaveProperty("date", "25th December 2023");
        expect(responseResult.body.data).toHaveProperty("_id", testEventId);
    });
    // UPDATE
    test("PATCH request.body of updatedEventData returns eventData with updates", async () => {
        let updatedEventData = {
            content: "update: I hate events",
        };
        const responseResult = await request(app)
            .patch("/events/" + testEventId)
            .send(updatedEventData);

        expect(responseResult.body.message).toHaveProperty("content", "update: I hate events");
    });
    // DELETE
    test("DELETE event returns message with event title", async () => {
        const responseResult = await request(app).delete("/events/" + testEventId);

        expect(responseResult.body.message).toEqual("deleting event: NewEvent");
    });
    test("done", () => {
        console.log("tests finished");
    });
});
