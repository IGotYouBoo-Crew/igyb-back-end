const mongoose = require("mongoose");
// Make the .env data ready for use.
const dotenv = require("dotenv");
dotenv.config();

// Import the Express package and configure some needed data.
const express = require("express");
const app = express();

// If no process.env.X is found, assign a default value instead.
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
// Any front-end that should interact with this API should be
// listed in the array of origins for CORS configuration.
const cors = require("cors");
var corsOptions = {
    origin: ["http://localhost:5000", "https://igotyouboo.netlify.com"],
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
// Adds event routes
const eventController = require("./controllers/EventRouter");
app.use("/events", eventController);

// Return a bunch of useful details from the database connection
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

// A 404 route should only trigger if no preceding routes or middleware was run.
app.get("*", (request, response) => {
    response.status(404).json({
        message: "No route with that path found!",
        attemptedPath: request.path,
    });
});

app.use((error, request, response, next) => {
    console.log(`Error: ${error}`)
    if (response.headersSent) {
        return next(error);
    }
    if (response.statusCode === 200) {
        response.status(500);
    }
    response.json({
        errors: error.toString(),
    });
});

// Export everything needed to run the server.
module.exports = {
    app,
    PORT,
};
