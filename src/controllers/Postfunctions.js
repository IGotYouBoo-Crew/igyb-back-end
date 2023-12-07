// Require specific models so that we can 
// create functionality involving them.
const { Post } = require('../models/PostModel');

// Model.find({}) returns all documents in a collection.
async function getAllPosts(){
    return await Post.find({}).populate("author", "username");
}

async function getPostById(postId){
    // finds one user with matching username
    return await Post.findOne({id: postId}).exec()
}

// Export the functions for our routes to use.
module.exports = {
    getAllPosts,
    getPostById
}