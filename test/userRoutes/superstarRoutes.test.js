// Test the routes from server.js
const { default: mongoose } = require("mongoose");
const { databaseConnect } = require("../../src/database");
const { app } = require("../../src/server");
let bcrypt = require('bcrypt')
// Import supertest so we can manage the app/server in tests properly
const request = require("supertest");
const { getRoleIdByName } = require("../../src/controllers/functions/RoleFunctions");
const { verifyJwt } = require("../../src/controllers/functions/JwtFunctions");
var session = require("supertest-session")


var testSession = session(app)
var authenticatedSession

let loginDetails = {
    "username": "User4",
    "password": "fakepassword"
}

beforeEach(async () => {
    server = app.listen(3030, async () => {
        await databaseConnect();
    });
    // This (attempts to) sign-in as User4 before each test is run
    await testSession.post("/account/signIn").send(loginDetails)
    // If the test uses authenticatedSession, then it will use the signed-in session (with cookie)
    authenticatedSession = testSession
});

afterEach(() => {
    server.close();
});

afterAll(() => {
    mongoose.disconnect()
})




describe("Signed in UserController routes work and accept/return data correctly", () => {
    // CREATE
    // This test uses request(app) and not authenticatedSession because is used to create the user that we sign in as
    // the authenticatedSession at this point is actually a 404 lol
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

    // this test is run to get the userOneId --> used to test updating another user's account
    test("'account/user1' route exists and returns user1's data", async () => {
        const responseResult = await request(app).get("/account/user1");
        expect(responseResult.body.data).toHaveProperty("username", "user1");
        expect(responseResult.body.data).toHaveProperty("_id");
        // global variable used later
        userOneId = responseResult.body.data._id
    });

    // UPDATE
    test("PATCH request.body of updatedUserData fails if user is not signed in", async () => {
        let updatedUserData = {
            "pronouns": "she/her"
        }
        // request(app) used to test unauthenticated attempt
        let unauthenticatedResult = await request(app).patch("/account/" + testUserId).send(updatedUserData)
        expect(unauthenticatedResult.body).toHaveProperty("errors", "Error: User not signed in")
    })
    test("PATCH request.body of updatedUserData fails if user is not OP or Admin", async () => {
        let updatedUserData = {
            "pronouns": "she/her"
        }
        // authenticatedSession used to test signed-in attempt
        // Here, we expect it to fail again, but for different reasons
        let testResponse =  await authenticatedSession.patch("/account/" + userOneId).send(updatedUserData)
        expect(testResponse.body).toHaveProperty("errors", "Error: You are not authorised to make these changes to another user's account")
    })
    
    test("PATCH request.body of updatedUserData returns userData with updates if OP", async () => {
        let updatedUserData = {
            "pronouns": "she/her"
        }
        console.log("test user id:" + testUserId)
        const responseResult = await authenticatedSession.patch("/account/" + testUserId).send(updatedUserData)
        console.log(responseResult.body)
        expect(responseResult.body.message).toHaveProperty("pronouns", "she/her")
    })
    // test("PATCH request.body of updatedUserData returns userData with updates if admin", async () => {
    //     let updatedUserData = {
    //         "pronouns": "xe/xer"
    //     }
    //     const responseResult = await request(app).patch("/account/" + adminUserId).send(updatedUserData).set("jwt", adminJwt)
    //     expect(responseResult.body.message).toHaveProperty("pronouns", "xe/xer")
    // })


    // // Auth testing testing
    // test("no jwt fails with error handling", async () => {
    //     const responseResult = await request(app).post("/account/someOtherProtectedRoute")
    //     expect(responseResult.body.errors).toEqual("Error: No JWT Attached")
    // })
    // test("jwt passes", async () => {
    //     const responseResult = await request(app).post("/account/someOtherProtectedRoute").set("jwt", jwt)

    //     expect(responseResult.body).toHaveProperty("refreshedJWT")
    //     expect(responseResult.body).toHaveProperty("userRole")
    //     expect(responseResult.body).toHaveProperty("userId", testUserId)
    // })

    // test("I can access cookies in jest", async () => {

    //     const responseResult = await request(app).post("/account/signIn").send(loginDetails)
    //     cookie = responseResult.headers["set-cookie"]
    //     expect(responseResult.headers).toHaveProperty("set-cookie")
    // })

    // // DELETE
    // test("DELETE userData fails when not original user or admin", async () => {
    //     const responseResult = await request(app).delete("/account/" + userOneId).set("jwt", jwt)
    //     expect(responseResult.body.errors).toEqual("Error: You are not authorised to make these changes to another user's account")
    // })
    // test("DELETE userData returns message with username", async () => {
    //     const responseResult = await request(app).delete("/account/" + testUserId).set("jwt", jwt)
    //     expect(responseResult.body.message).toEqual("deleting user: User4")
    // })

});

// describe("PostsController routes work and accept/return data correctly", () => {
//     // CREATE
//     test("POST request.body of newPostData returns newPostData", async () => {
//         let newPostData = {
//             "title": "NewPost",
//             "content": "Oh boy, I loooove content"
//         };
//         const responseResult = await request(app).post("/posts/newPost").send(newPostData);
//         testPostId = responseResult.body.data._id

//         expect(responseResult.body.data).toHaveProperty("title", newPostData.title);
//         expect(responseResult.body.data).toHaveProperty("content", newPostData.content);
//         expect(responseResult.body.data).toHaveProperty("_id", testPostId);
//     });
//     // READ
//     test("GET 'posts/testPostId' route exists and returns testPostId's data", async () => {
//         const responseResult = await request(app).get("/posts/" + testPostId);
        
//         expect(responseResult.body.data).toHaveProperty("title", "NewPost");
//         expect(responseResult.body.data).toHaveProperty("content", "Oh boy, I loooove content");
//         expect(responseResult.body.data).toHaveProperty("_id", testPostId);
//     });
//     // UPDATE
//     test("PATCH request.body of updatedPostData returns userData with updates", async () => {
//         let updatedPostData = {
//             "content": "update: I hate content"
//         }
//         const responseResult = await request(app).patch("/posts/" + testPostId).send(updatedPostData)
        
//         expect(responseResult.body.message).toHaveProperty("content", "update: I hate content")
//     })
//     // DELETE
//     test("DELETE userData returns message with username", async () => {
//         const responseResult = await request(app).delete("/posts/" + testPostId)
        
//         expect(responseResult.body.message).toEqual("deleting post: NewPost")
//     })
// });
// describe("EventsController routes work and accept/return data correctly", () => {
//     // CREATE
//     test("POST request.body of newEventData returns newEventData", async () => {
//         let newEventData = {
//             "title": "NewEvent",
//             "content": "Oh boy, I loooove events",
//             "date": "25th December 2023"
//         };
//         const responseResult = await request(app).post("/events/newEvent").send(newEventData);
//         testEventId = responseResult.body.data._id

//         expect(responseResult.body.data).toHaveProperty("title", newEventData.title);
//         expect(responseResult.body.data).toHaveProperty("content", newEventData.content);
//         expect(responseResult.body.data).toHaveProperty("date", newEventData.date);
//         expect(responseResult.body.data).toHaveProperty("_id", testEventId);
//     });
//     // READ
//     test("GET 'events/testEventId' route exists and returns testEventId's data", async () => {
//         const responseResult = await request(app).get("/events/" + testEventId);
        
//         expect(responseResult.body.data).toHaveProperty("title", "NewEvent");
//         expect(responseResult.body.data).toHaveProperty("content", "Oh boy, I loooove events");
//         expect(responseResult.body.data).toHaveProperty("date", "25th December 2023");
//         expect(responseResult.body.data).toHaveProperty("_id", testEventId);
//     });
//     // UPDATE
//     test("PATCH request.body of updatedEventData returns eventData with updates", async () => {
//         let updatedEventData = {
//             "content": "update: I hate events"
//         }
//         const responseResult = await request(app).patch("/events/" + testEventId).send(updatedEventData)
        
//         expect(responseResult.body.message).toHaveProperty("content", "update: I hate events")
//     })
//     // DELETE
//     test("DELETE event returns message with event title", async () => {
//         const responseResult = await request(app).delete("/events/" + testEventId)
        
//         expect(responseResult.body.message).toEqual("deleting event: NewEvent")
//     })
//     test("done", () =>{
//         console.log("tests finished")
//     })
// });
