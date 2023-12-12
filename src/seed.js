const mongoose = require("mongoose");
const { databaseConnect } = require("./database");
// import models needed
const { User } = require("./models/UserModel");
const { Post } = require("./models/PostModel");
const { Role } = require("./models/RoleModel");
const dotenv = require("dotenv");
const { Event } = require("./models/EventModel");

dotenv.config;

const roles = [
    {
        name: "Superstar",
        description: "User of IGYB",
    },
    {
        name: "Admin",
        description: "Administrator of IGYB",
    },
];

const users = [
    {
        email: "user1@email.com",
        username: "user1",
        password: "this is fake data",
        pronouns: "fake/data",
        role: null,
    },
    {
        email: "user2@email.com",
        username: "user2",
        password: "this is fake data",
        pronouns: "fake/data",
        role: null,
    },
];

const posts = [
    {
        title: "first post",
        content: "this is the first fake post",
        author: null,
    },
    {
        title: "second post",
        content: "this is the second fake post",
        author: null,
    },
];
const events = [
    {
        title: "first event",
        content: "this is the first fake event",
        date: "25th December 2023",
        author: null,
    },
    {
        title: "second event",
        content: "this is the second fake event",
        date: "26th December 2023",
        author: null,
    },
];

seedDb()

function seedDb() {
    databaseConnect()
        .catch((error) => {
            console.log(`An error occurred while connecting to the database:\n${error}`);
        })
        .then(() => {
            console.log("Database connected successfully when seeding!");
        })
        .then(async () => {
            if (process.env.WIPE === "true") {
                // get the names of all collections in the DB
                const collections = await mongoose.connection.db.listCollections().toArray();
                // empty data and collections from the DB
                collections
                    .map((collection) => collection.name)
                    .forEach(async (collectionName) => {
                        mongoose.connection.db.dropCollection(collectionName);
                    });
                console.log("Old DB data deleted");
            }
        })
        .then(async () => {
            // add new data
            let rolesCreated = await Role.insertMany(roles);
            for (const user of users) {
                user.role = rolesCreated[Math.floor(Math.random() * rolesCreated.length)].id;
            }
            let usersCreated = await User.insertMany(users);
            for (const post of posts) {
                post.author = usersCreated[Math.floor(Math.random() * usersCreated.length)].id;
            }
            await Post.insertMany(posts);
            for (const event of events) {
                event.author = usersCreated[Math.floor(Math.random() * usersCreated.length)].id;
            }
            await Event.insertMany(events);
            console.log("New DB data created");
        })
        .then(() => {
            // dc from db
            mongoose.connection.close();
            console.log("DB seed connection closed");
        });
}

module.exports = { seedDb }