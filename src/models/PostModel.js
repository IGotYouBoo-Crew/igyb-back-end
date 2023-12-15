const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
    title: {type: String, required: true},
    image: {type: String, required: false},
    content: {type: String, required: true},
    author: {type: mongoose.Types.ObjectId, ref: 'User'}
});

const Post = mongoose.model("Post", PostSchema);

module.exports = { Post };
