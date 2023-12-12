require("dotenv").config();

// Import the configured items from the server file:
var { app } = require("./server");

const { databaseConnect } = require("./database");
// If no process.env.X is found, assign a default value instead.
const PORT = process.env.PORT || 3000;

// Run the server
app.listen(PORT, async () => {
    await databaseConnect();
    console.log(`
    I Got You Boo API is now running!

    Congrats!
    `);
});