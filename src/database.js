const mongoose = require('mongoose');


async function databaseConnector(databaseURL){
    await mongoose.connect(databaseURL);
}

async function databaseDisconnector(){
    await mongoose.connection.close();
}

module.exports = {
    databaseConnector,
    databaseDisconnector
}

// For after deploy

// const mongoose = require("mongoose");
// require("dotenv").config();
// const DB_URI = process.env.DB_URI;


// /**
//  * Connect or create & connect to a DB
//  * @date 31/10/2023 - 20:20:08
//  *
//  * @async
//  * @returns
//  */
// async function databaseConnect() {
//     try {
//         // db connection can take time, wait is required
//         console.log("connecting to " + DB_URI)
//         await mongoose.connect(DB_URI);
//         console.log("Database connected");
//     } catch (error) {
//         console.log(`databaseConnect failed to connect to DB: \n${JSON.stringify(error)}`);
//     }
// }

// module.exports = {
//     databaseConnect,
// };
