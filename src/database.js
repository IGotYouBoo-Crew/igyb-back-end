const mongoose = require('mongoose');
require("dotenv").config();

const DB_URI = process.env.DB_URI;

async function databaseConnect() {
    try {
        // db connection can take time, wait is required
        console.log("connecting to " + DB_URI)
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