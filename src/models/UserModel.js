const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
    email: {type: String, required: true, unique: true},
    password: {type: String, required: true},
    username: {type: String, required: true, unique: true},
    pronouns: String,
    // name: String
    // profilePicture:
    role: {
        type: mongoose.Types.ObjectId,
        ref: "Role",
    },
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };
