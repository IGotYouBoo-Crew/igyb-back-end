const mongoose = require("mongoose");
const { usernameValidators, emailValidators } = require("./validatorFunctions/userValidators");

const UserSchema = new mongoose.Schema({
    profilePicture: {
        type: String,
        required: true,
        default:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrb5zM9IM0Calt0JRegObDpvq61W6wZ2BdGAQ1dF-i_g&s",
    },
    email: {
        type: String,
        required: true,
        unique: true,
        validate: emailValidators,
    },
    password: { type: String, required: true },
    username: {
        type: String,
        required: true,
        unique: true,
        validate: usernameValidators,
    },
    pronouns: { type: String, default: "" },
    role: {
        type: mongoose.Types.ObjectId,
        ref: "Role",
    },
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };
