const mongoose = require("mongoose");
const { databaseConnect } = require("./database");
// import models needed
const { User } = require("./models/UserModel");
const { Post } = require("./models/PostModel");
const { Comment } = require("./models/CommentModel");
const { Role } = require("./models/RoleModel");
const dotenv = require("dotenv");
const { Event } = require("./models/EventModel");
const { getAllRoles } = require("./controllers/functions/RoleFunctions");
const { hashString } = require("./controllers/functions/EncryptionFunctions");

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

let hashedPassword = async(adminPassword) => {
    return await hashString(adminPassword)
}
const adminUser = {
    email: "admin@email.com",
    username: "Admin1",
    password: hashedPassword("adminPassword"),
    pronouns: "ad/min",
    role: null,
}

const posts = [
    {
        title: "first seeded post",
        caption: "first seeded post caption",
        body: "first seeded post body...",
        photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbi6SmUiWTXz4_ve03OoxVJQ2_g7jaKxvi20DIMxsLlv5zDleZqMnfX1OaJGtpOs56UUw&usqp=CAU",
        author: null,
    },
    {
        title: "second seeded post",
        caption: "second seeded post caption",
        body: "second seeded post body...",
        photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbi6SmUiWTXz4_ve03OoxVJQ2_g7jaKxvi20DIMxsLlv5zDleZqMnfX1OaJGtpOs56UUw&usqp=CAU",
        author: null,
    },
    {
        title: "third seeded post",
        caption: "third seeded post caption",
        body: "third seeded post body...",
        photo: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSbi6SmUiWTXz4_ve03OoxVJQ2_g7jaKxvi20DIMxsLlv5zDleZqMnfX1OaJGtpOs56UUw&usqp=CAU",
        author: null,
    },
];

const comments = [
    {
        desc: "first seeded comment",
        parentPostId: null,
        author: null,
    },
    {
        desc: "second seeded comment",
        parentPostId: null,
        author: null,
    },
];

const events = [
    {
        host: "Captain Naomi",
        image: "https://img.freepik.com/premium-vector/potato-head-cartoon-pilot-mascot-cartoon-vector_193274-39483.jpg?w=2000",
        title: "first seeded event",
        date: "2023-12-25",
        start: "12:00",
        finish: "14:00",
        content: "this is the first fake event",
        author: null,
    },
    {
        host: "Queen Ella",
        image: "https://pbs.twimg.com/profile_images/1136133643900866563/TNAIerMx_400x400.jpg",
        title: "second seeded event",
        date: "2024-02-28",
        start: "08:00",
        finish: "20:00",
        ticketLink: "https://premier.ticketek.com.au/",
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
            let postsCreated = await Post.insertMany(posts);
            console.log(postsCreated);
            for (const comment of comments) {
                comment.author = usersCreated[Math.floor(Math.random() * usersCreated.length)].id;
                comment.parentPostId = postsCreated[Math.floor(Math.random() * postsCreated.length)].id;
            }
            let commentsCreated = await Comment.insertMany(comments);
            console.log(commentsCreated);
            for (const event of events) {
                event.author = usersCreated[Math.floor(Math.random() * usersCreated.length)].id;
            }
            let eventsCreated = await Event.insertMany(events);
            console.log(eventsCreated);
            console.log("New DB data created");
        })
        .then(() => {
            // dc from db
            mongoose.connection.close();
            console.log("DB seed connection closed");
        });
}

module.exports = { seedDb }