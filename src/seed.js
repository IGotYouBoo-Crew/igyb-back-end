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
};

const posts = [
    {
        title: "How I got the job!",
        caption: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eu ex malesuada, rutrum nunc a, condimentum dui. Nulla facilisi. Donec hendrerit efficitur augue id vestibulum. Etiam maximus enim augue, nec gravida neque porta ut. In nulla mauris, euismod lacinia viverra id, sollicitudin id enim. Morbi eget dapibus purus, id cursus erat. Morbi mollis lacus non dapibus vestibulum. Etiam tincidunt erat maximus erat ultrices, in egestas nisi facilisis. Phasellus non rhoncus elit. Donec vulputate, ante vel vehicula sagittis, enim erat pharetra felis, sit amet euismod velit tortor ut lacus. Vestibulum volutpat tristique libero, non dignissim odio.",
        photo: "https://i0.wp.com/www.alphr.com/wp-content/uploads/2018/11/how_to_get_a_job_at_google_apple_microsoft.jpg?fit=2048%2C1152&ssl=1",
        author: null,
    },
    {
        title: "I need advice...",
        caption: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eu ex malesuada, rutrum nunc a, condimentum dui. Nulla facilisi. Donec hendrerit efficitur augue id vestibulum. Etiam maximus enim augue, nec gravida neque porta ut. In nulla mauris, euismod lacinia viverra id, sollicitudin id enim. Morbi eget dapibus purus, id cursus erat. Morbi mollis lacus non dapibus vestibulum. Etiam tincidunt erat maximus erat ultrices, in egestas nisi facilisis. Phasellus non rhoncus elit. Donec vulputate, ante vel vehicula sagittis, enim erat pharetra felis, sit amet euismod velit tortor ut lacus. Vestibulum volutpat tristique libero, non dignissim odio.",
        photo: "https://everydaypower.com/wp-content/uploads/2018/07/How-to-Stop-Being-Dazed-and-Confused-About-Your-Future.jpg",
        author: null,
    },
    {
        title: "How to be nicer",
        caption: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.",
        body: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas eu ex malesuada, rutrum nunc a, condimentum dui. Nulla facilisi. Donec hendrerit efficitur augue id vestibulum. Etiam maximus enim augue, nec gravida neque porta ut. In nulla mauris, euismod lacinia viverra id, sollicitudin id enim. Morbi eget dapibus purus, id cursus erat. Morbi mollis lacus non dapibus vestibulum. Etiam tincidunt erat maximus erat ultrices, in egestas nisi facilisis. Phasellus non rhoncus elit. Donec vulputate, ante vel vehicula sagittis, enim erat pharetra felis, sit amet euismod velit tortor ut lacus. Vestibulum volutpat tristique libero, non dignissim odio.",
        photo: "https://empoweredandthriving.com/wp-content/uploads/2022/05/how-to-be-nicer.jpg",
        author: null,
    },
];

const comments = [
    {
        desc: "This is great!",
        parentPostId: null,
        author: null,
    },
    {
        desc: "Nice post :)",
        parentPostId: null,
        author: null,
    },
];

const events = [
    {
        title: "first seeded event",
        host: "Captain Naomi",
        image: "https://pm1.aminoapps.com/7527/d9dfbba4a87d3ae3583aa74dbf831ba4ccd1243ar1-1488-1000v2_uhq.jpg",
        date: "Dec 25, 2023",
        start: "12:00",
        finish: "14:00",
        ticketLink: "https://www.pokemon.com/us/play-pokemon",
        content: "this is the first fake event",
        author: null,
    },
    {
        title: "second seeded event",
        host: "Queen Ella",
        image: "https://musicfeeds.com.au/wp-content/uploads/sites/7/2023/10/New-Project-2023-10-11T142201.049.jpg",
        date: "Feb 28, 2024",
        start: "08:00",
        finish: "20:00",
        ticketLink: "https://thewiggles.com/live",
        content: "this is the second fake event",
        author: null,
    },
];

seedDb();

function seedDb() {
    databaseConnect()
        .catch((error) => {
            console.log(
                `An error occurred while connecting to the database:\n${error}`
            );
        })
        .then(() => {
            console.log("Database connected successfully when seeding!");
        })
        .then(async () => {
            if (process.env.WIPE === "true") {
                // get the names of all collections in the DB
                const collections = await mongoose.connection.db
                    .listCollections()
                    .toArray();
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
            console.log(await Role.find({}));
            for (const user of users) {
                user.role =
                    rolesCreated[
                        Math.floor(Math.random() * rolesCreated.length)
                    ].id;
            }
            adminUser.role = rolesCreated[1].id;
            await User.create(adminUser);
            let usersCreated = await User.insertMany(users);
            for (const post of posts) {
                post.author =
                    usersCreated[
                        Math.floor(Math.random() * usersCreated.length)
                    ].id;
            }
            let postsCreated = await Post.insertMany(posts);
            console.log(postsCreated);
            for (const comment of comments) {
                comment.author =
                    usersCreated[
                        Math.floor(Math.random() * usersCreated.length)
                    ].id;
                comment.parentPostId =
                    postsCreated[
                        Math.floor(Math.random() * postsCreated.length)
                    ].id;
            }
            let commentsCreated = await Comment.insertMany(comments);
            console.log(commentsCreated);
            for (const event of events) {
                event.author =
                    usersCreated[
                        Math.floor(Math.random() * usersCreated.length)
                    ].id;
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

module.exports = { seedDb };
