const mongoose = require('mongoose');
require("dotenv").config();

let DB_URI = "";

switch (process.env.NODE_ENV.toLowerCase()) {
    case "test":
        DB_URI = "mongodb://localhost:27017/IGotYouBoo-test";
        break;
    case "development":
        DB_URI = "mongodb://localhost:27017/IGotYouBoo-dev";
        break;
    case "production":
        DB_URI = process.env.DB_URI;
        break;
    default:
        console.error("Incorrect JS environment specified, database will not be connected.");
        break;
}

async function databaseConnect() {
    try {
        // db connection can take time, wait is required
        console.log("connecting to database at url: " + DB_URI)
        await mongoose.connect(DB_URI);
        console.log("Database connected");
    } catch (error) {
        console.log(`databaseConnect failed to connect to DB: \n${JSON.stringify(error)}`);
    }
}

async function databaseDisconnector(){
    await connection.close();
}

module.exports = {
    databaseConnect,
    databaseDisconnector
}