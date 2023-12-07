const mongoose = require("mongoose");
// Make the .env data ready for use.
const dotenv = require("dotenv");
dotenv.config();

// Import the Express package and configure some needed data.
const express = require("express");
const app = express();
// If no process.env.X is found, assign a default value instead.
const HOST = process.env.HOST || "localhost";
const PORT = process.env.PORT || 3000;

// Configure some basic Helmet settings on the server instance.
const helmet = require("helmet");
app.use(helmet());
app.use(helmet.permittedCrossDomainPolicies());
app.use(helmet.referrerPolicy());
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: ["'self'"],
        },
    })
);

// Configure some basic CORS settings on the server instance.
// These origin values don't actually have to be anything -
// this project exists without a front-end, but any front-end
// that should interact with this API should be listed in the
// array of origins for CORS configuration.
const cors = require("cors");
var corsOptions = {
    origin: ["http://localhost:5000", "https://deployedApp.com"],
    optionsSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Configure some API-friendly request data formatting.
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Adds roles routes
const rolesController = require("./controllers/RoleRouter");
app.use("/roles", rolesController);
// Adds user routes
const userController = require("./controllers/UserRouter");
app.use("/account", userController);
// Adds post routes
const postController = require("./controllers/PostRouter");
app.use("/posts", postController);

var databaseURL = "";
switch (process.env.NODE_ENV.toLowerCase()) {
    case "test":
        databaseURL = "mongodb://localhost:27017/IGotYouBoo-test";
        break;
    case "development":
        databaseURL = "mongodb://localhost:27017/IGotYouBoo-dev";
        break;
    case "production":
        databaseURL = process.env.DATABASE_URL;
        break;
    default:
        console.error("Incorrect JS environment specified, database will not be connected.");
        break;
}

const { databaseConnector } = require("./database");
databaseConnector(databaseURL)
    .then(() => {
        console.log("Database connected successfully!");
    })
    .catch((error) => {
        console.log(`
    Some error occurred connecting to the database! It was: 
    ${error}
    `);
    });

// Return a bunch of useful details from the database connection
// Dig into each property here:
// https://mongoosejs.com/docs/api/connection.html
app.get("/databaseHealth", (request, response) => {
    let databaseState = mongoose.connection.readyState;
    let databaseName = mongoose.connection.name;
    let databaseModels = mongoose.connection.modelNames();
    let databaseHost = mongoose.connection.host;

    response.json({
        readyState: databaseState,
        dbName: databaseName,
        dbModels: databaseModels,
        dbHost: databaseHost,
    });
});

// Add a route just to make sure things work.
// This path is the server API's "homepage".
app.get("/", (request, response) => {
    response.json({
        message: "Hello world!",
    });
});

// add a route to dump all database data
app.get("/databaseDump", async (request, response) => {
    // sets up an object to store data
    const dumpContainer = {};

    // get names of DB collections
    var collections = await mongoose.connection.db.listCollections().toArray();
    collections = collections.map((collection) => collection.name);

    // gets all data from each collection and store in dumpContainer
    for (const collectionName of collections) {
        let collectionData = await mongoose.connection.db
            .collection(collectionName)
            .find({})
            .toArray();
        dumpContainer[collectionName] = collectionData;
    }

    // confirm in terminal that server is returning correct data
    console.log("dumping data to client: \n" + JSON.stringify(dumpContainer, null, 4));

    // return data object
    response.json({
        data: dumpContainer,
    });
});

// Keep this route at the end of this file, only before the module.exports!
// A 404 route should only trigger if no preceding routes or middleware was run.
// So, put this below where any other routes are placed within this file.
app.get("*", (request, response) => {
    response.status(404).json({
        message: "No route with that path found!",
        attemptedPath: request.path,
    });
});

// Export everything needed to run the server.
module.exports = {
    HOST,
    PORT,
    app,
};
