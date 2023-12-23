// Test the routes from server.js
const { default: mongoose } = require("mongoose");
const { databaseConnect } = require("../../src/database");
const { app } = require("../../src/server");
// Import supertest so we can manage the app/server in tests properly
const request = require("supertest");
var session = require("supertest-session");

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

describe("User Model validation rejects invalid data correctly", () => {
    // CREATE
    // This test uses request(app) and not authenticatedSession because is used to create the user that we sign in as
    // the authenticatedSession at this point is actually a 404 lol
    test("POST newUserData rejects invalid email address", async () => {
        let newUserData = {
            email: "someEmail",
            password: "fakepassword",
            username: "User4",
            pronouns: "he/him",
        };

        const responseResult = await request(app).post("/account/newUser").send(newUserData);
        const responseData = responseResult.body
        expect(responseData.errors).toEqual(`User validation failed: email: ${newUserData.email} is not a valid email address`)
    });

    test("POST newUserData rejects invalid email: whitespace", async () => {
        let newUserData = {
            email: "postedUser@email.com ",
            password: "fakepassword",
            username: "User4",
            pronouns: "he/him",
        };

        const responseResult = await request(app).post("/account/newUser").send(newUserData);
        const responseData = responseResult.body
        console.log(responseData)
        expect(responseData.errors).toEqual(`User validation failed: email: ${newUserData.email} is not a valid email address`)
    });
    test("POST newUserData rejects invalid username: whitespace", async () => {
        let newUserData = {
            email: "postedUser@email.com",
            password: "fakepassword",
            username: "   ",
            pronouns: "he/him",
        };

        const responseResult = await request(app).post("/account/newUser").send(newUserData);
        const responseData = responseResult.body
        console.log(responseData)
        expect(responseData.errors).toEqual(`User validation failed: username: Usernames cannot contain whitespace`)
    });
    test("POST newUserData rejects invalid username: too long", async () => {
        let newUserData = {
            email: "postedUser@email.com",
            password: "fakepassword",
            username: "123456789011121314151617181920",
            pronouns: "he/him",
        };

        const responseResult = await request(app).post("/account/newUser").send(newUserData);
        const responseData = responseResult.body
        console.log(responseData)
        expect(responseData.errors).toEqual(`User validation failed: username: Usernames can be a max of 16 characters`)
    });
    test("POST newUserData rejects invalid username: too long", async () => {
        let newUserData = {
            email: "postedUser@email.com",
            password: "fakepassword",
            username: "User4",
            pronouns: "he/him",
        };

        const responseResult = await request(app).post("/account/newUser").send(newUserData);
        const responseData = responseResult.body
        expect(responseData.errors).toEqual(undefined)
        expect(responseData.data.username).toEqual("User4")
    });
    
    // CREATE
    test("POST newEventData with invalid time fails validation", async () => {
        let newEventData = {
            title: "Hot Potato Test Event",
            host: "Boiled Potato",
            image: "https://t4.ftcdn.net/jpg/03/43/50/71/360_F_343507119_ZEc4MsKNcqhPpCQlk5SZ3KEZmUz4d8u2.jpg",
            date: "Dec 31, 2023",
            start: "1262",
            finish: "15:00",
            ticketLink: "https://thewiggles.com/live",
            content: "I'm trying to create a test event and I'm a potato"
        };
        
        let responseResult = await authenticatedSession.post("/events/").send(newEventData);
        expect(responseResult.body).toHaveProperty("errors", `ValidationError: start: ${newEventData.start} is not valid 24hr time!`);

        newEventData.start = "abcd"
        responseResult = await authenticatedSession.post("/events/").send(newEventData);
        expect(responseResult.body).toHaveProperty("errors", `ValidationError: start: ${newEventData.start} is not valid 24hr time!`);

        newEventData.start = "1200"
        responseResult = await authenticatedSession.post("/events/").send(newEventData);
        expect(responseResult.body).toHaveProperty("errors", `ValidationError: start: ${newEventData.start} is not valid 24hr time!`);

        newEventData.start = "200"
        responseResult = await authenticatedSession.post("/events/").send(newEventData);
        expect(responseResult.body).toHaveProperty("errors", `ValidationError: start: ${newEventData.start} is not valid 24hr time!`);

        newEventData.start = "20:100"
        responseResult = await authenticatedSession.post("/events/").send(newEventData);
        expect(responseResult.body).toHaveProperty("errors", `ValidationError: start: ${newEventData.start} is not valid 24hr time!`);

        newEventData.start = "24:10"
        responseResult = await authenticatedSession.post("/events/").send(newEventData);
        expect(responseResult.body).toHaveProperty("errors", `ValidationError: start: ${newEventData.start} is not valid 24hr time!`);

        newEventData.start = "24:00"
        responseResult = await authenticatedSession.post("/events/").send(newEventData);
        expect(responseResult.body).toHaveProperty("errors", `ValidationError: start: ${newEventData.start} is not valid 24hr time!`);

        newEventData.start = "24:30:00"
        responseResult = await authenticatedSession.post("/events/").send(newEventData);
        expect(responseResult.body).toHaveProperty("errors", `ValidationError: start: ${newEventData.start} is not valid 24hr time!`);
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
