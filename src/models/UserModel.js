const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    pronouns: String,
    profilePicture: {
        type: String,
        required: true,
        default:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrb5zM9IM0Calt0JRegObDpvq61W6wZ2BdGAQ1dF-i_g&s",
    },
    role: {
        type: mongoose.Types.ObjectId,
        ref: "Role",
    },
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };
