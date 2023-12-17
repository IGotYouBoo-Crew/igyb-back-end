// Require specific models so that we can 
// create functionality involving them.
const { uploadPicture } = require('../middleware/uploadPictureMiddleware');
const {fileRemover} = require('../../utils/fileRemover')
const { Post } = require('../../models/PostModel');
const {v4: uuidv4} = require('uuid');

// CREATE
// async function createNewPost(data){
//     return await Post.create(data).catch((error) => error)
// }

const createPost = async (req, res, next) => {
    try {
        const post = new Post({
            title: "sample title",
            caption: `sample caption`,
            slug: uuidv4(),
            body: {
                type: "doc",
                content: [],
            },
            photo: "",
            author: req.user._id,
        });

        const createdPost = await post.save();
        return res.json(createdPost);
        
    } catch (error) {
        next(error);
    }
}


// READ
// Model.find({}) returns all documents in a collection.
async function getAllPosts(){
    return await Post.find({}).populate("author", "username");
    
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
    createPost,
    getAllPosts,
    getPostByTitle,
    getPostById,
    deletePostById,
    updatePostById,
    // createNewPost
}