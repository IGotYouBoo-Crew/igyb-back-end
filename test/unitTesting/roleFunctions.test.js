const {
    getAllRoles,
    getUsersWithRole,
    getRoleIdByName,
    getRoleNameById,
} = require("../../src/controllers/functions/RoleFunctions");
const { default: mongoose } = require("mongoose");
const { app } = require("../../src/server");
const { databaseConnect } = require("../../src/database");


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

// Test the functions from UserFunctions.js
describe("RoleFunctions functions work as expected", () => {

    test("getAllRoles function exists and returns expected value", async () => {
        let response = await getAllRoles()
        expect(typeof response).toEqual("object")
        expect(response.errors).toEqual(undefined)
    });
    
    test("getUsersWithRole function exists and returns expected value", async () => {
        let response = await getUsersWithRole("Admin")
        expect(typeof response).toEqual("object")
        expect(response.errors).toEqual(undefined)
    });

    test("getRoleIdByName function exists and returns expected value", async () => {
        let response = await getRoleIdByName("Superstar")
        expect(typeof response).toEqual("string")
        expect(response.errors).toEqual(undefined)
    });
    
    test("getRoleNameById function exists and returns expected value", async () => {
        let roleData = await getRoleIdByName("Superstar")
        let response = await getRoleNameById(roleData)
        expect(response).toEqual("Superstar")
    });

});


