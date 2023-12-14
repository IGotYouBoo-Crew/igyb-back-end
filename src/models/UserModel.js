const mongoose = require("mongoose");
const { getRoleIdByName } = require("../controllers/functions/RoleFunctions");

const UserSchema = new mongoose.Schema({
    email: String,
    password: String,
    username: String,
    pronouns: String,
    role: {
        type: mongoose.Types.ObjectId,
        ref: "Role",
        default: () => {
            return getRoleIdByName("Superstar") || null;
        },
    },
});

const User = mongoose.model("User", UserSchema);

module.exports = { User };
