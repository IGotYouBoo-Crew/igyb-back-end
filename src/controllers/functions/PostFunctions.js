// Require specific models so that we can 
// create functionality involving them.
const { Post } = require('../../models/PostModel');

// CREATE
async function createNewUser(data){
    return await Post.create(data).catch((error) => error)
}

// READ
// Model.find({}) returns all documents in a collection.
async function getAllPosts(){
    return await Post.find({}).populate("role");
    
}

async function getPostByTitle(postTitle){
    // finds one post with matching postTitle
    return await Post.findOne({title: postTitle}).exec()
}

async function getPostById(postId){
    // finds post with matching postId
    return await Post.findById(postId).exec()
}

// UPDATE
async function updatePostById(postId, updatedPostData){
    return await Post.findByIdAndUpdate(postId, updatedPostData, { runValidators: true, returnDocument: 'after' }).exec()
}

// DELETE
async function deletePostById(postId){
    return await Post.findByIdAndDelete(postId).exec()
}

// Export the functions for our routes to use.
module.exports = {
    getAllPosts,
    getPostByTitle,
    getPostById,
    deletePostById,
    updatePostById,
    createNewPost
}