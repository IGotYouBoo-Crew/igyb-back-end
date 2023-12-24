require("dotenv").config();

// Import the configured items from the server file:
var { app, PORT } = require("./server");

const { databaseConnect } = require("./database");

// Run the server
app.listen(PORT, async () => {
    await databaseConnect();
    console.log(`
    I Got You Boo API is now running!

    Congrats!
    `);
});
