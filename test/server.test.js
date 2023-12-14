// Test the routes from server.js
const { default: mongoose } = require("mongoose");
const { databaseConnect } = require("../src/database");
const { app } = require("../src/server");
let bcrypt = require('bcrypt')
// Import supertest so we can manage the app/server in tests properly
const request = require("supertest");
const { getRoleIdByName } = require("../src/controllers/functions/RoleFunctions");
const { verifyJwt } = require("../src/controllers/functions/JwtFunctions");


beforeEach(async () => {
    server = app.listen(3030, async () => {
        await databaseConnect();
    });
});

afterEach(() => {
    server.close();
});

afterAll(() => {
    mongoose.disconnect()
})

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
        console.log(responseResult.body)
        expect(responseResult.body).toHaveProperty("dbModels");
    });
});

describe("UserController routes work and accept/return data correctly", () => {
    // CREATE
    test("POST request.body of newUserData returns newUserData and JWT", async () => {
        let newUserData = {
            "email": "postedUser@email.com",
            "password": "fakepassword",
            "username": "User4",
            "pronouns": "he/him",
        };
        
        const responseResult = await request(app).post("/account/newUser").send(newUserData);
        const responseData = responseResult.body.data
        // global variable used to access same document later for Update and Delete actions
        testUserId = responseData._id
        jwt = responseResult.body.JWT
        let compareEncryptedPassword = bcrypt.compareSync(newUserData.password, responseData.password)
        let superstarRoleID = await getRoleIdByName("Superstar")
        

        expect(responseResult.body).toHaveProperty("JWT")
        expect(verifyJwt(responseResult.body.JWT)).toHaveProperty("signature")
        expect(compareEncryptedPassword).toEqual(true)
        expect(responseData).toHaveProperty("email", newUserData.email);
        expect(responseData).toHaveProperty("role", superstarRoleID)
        expect(responseData).toHaveProperty("username", newUserData.username);
        expect(responseData).toHaveProperty("pronouns", newUserData.pronouns);
        expect(responseData).toHaveProperty("_id", testUserId);
    });
    // READ
    test("'account/user1' route exists and returns user1's data", async () => {
        const responseResult = await request(app).get("/account/user1");

        userOneId = responseResult.body.data._id
        
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


    // Auth testing testing
    test("no jwt fails with error handling", async () => {
        const responseResult = await request(app).post("/account/someOtherProtectedRoute")
        expect(responseResult.body.errors).toEqual("Error: No JWT Attached")
    })
    test("jwt passes", async () => {
        const responseResult = await request(app).post("/account/someOtherProtectedRoute").set("jwt", jwt)

        expect(responseResult.body).toHaveProperty("refreshedJWT")
        expect(responseResult.body).toHaveProperty("userRole")
        expect(responseResult.body).toHaveProperty("userId", testUserId)
    })

    // DELETE
    test("DELETE userData fails when not original user", async () => {
        const responseResult = await request(app).delete("/account/" + userOneId).set("jwt", jwt)
        
        expect(responseResult.body.errors).toEqual("Error: You are not authorised to make these changes to another user's account")
    })
    test("DELETE userData returns message with username", async () => {
        const responseResult = await request(app).delete("/account/" + testUserId).set("jwt", jwt)
        
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
            "content": "Oh boy, I loooove events",
            "date": "25th December 2023"
        };
        const responseResult = await request(app).post("/events/newEvent").send(newEventData);
        testEventId = responseResult.body.data._id

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
    test("done", () =>{
        console.log("tests finished")
    })
});
