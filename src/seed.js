const mongoose = require("mongoose");
const { databaseConnect } = require("./database");
// import models needed
const { User } = require("./models/UserModel");
const { Post } = require("./models/PostModel");
const { Role } = require("./models/RoleModel");
const dotenv = require("dotenv");
const { Event } = require("./models/EventModel");
const { getAllRoles } = require("./controllers/functions/RoleFunctions");

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

const adminUser = {
    email: "admin@email.com",
    username: "Admin1",
    password: "secretAdminPassword",
    pronouns: "ad/min",
    role: null,
}

const posts = [
    {
        title: "first post",
        caption: "fist post caption",
        slug: "123456",
        body: "post 1 body...",
        author: null,
    },
    {
        title: "second post",
        caption: "second post caption",
        slug: "2468",
        body: "post 2 body...",
        author: null,
    },
];
const events = [
    {
        host: "Captain Naomi",
        image: "https://pbs.twimg.com/profile_images/1056752759402307584/vFjSXrWY_400x400.jpg",
        title: "first event",
        date: "25th December 2023",
        start: "12:00",
        finish: "14:00",
        content: "this is the first fake event",
        author: null,
    },
    {
        host: "Queen Ella",
        title: "second event",
        date: "1st Jan 2024",
        start: "08:00",
        finish: "20:00",
        content: "this is the second fake event",
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
            console.log(await Role.find({}))
            for (const user of users) {
                user.role = rolesCreated[Math.floor(Math.random() * rolesCreated.length)].id;
            }
            adminUser.role = rolesCreated[1].id
            await User.create(adminUser)
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