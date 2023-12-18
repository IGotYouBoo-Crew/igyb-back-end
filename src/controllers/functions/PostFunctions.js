// Require specific models so that we can 
// create functionality involving them.
const { uploadPicture } = require('../middleware/uploadPictureMiddleware');
const {fileRemover} = require('../../utils/fileRemover')
const { Post } = require('../../models/PostModel');
const {v4: uuidv4} = require('uuid');
const { User } = require('../../models/UserModel');

// CREATE
// async function createNewPost(data){
//     return await Post.create(data).catch((error) => error)
// }

const createPost = async (request, response, next) => {
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
            author: request.headers.userId,
        });

        const createdPost = await post.save();
        return response.json(createdPost);
        
    } catch (error) {
        next(error);
    }
}

const updatePost = async (request, response, next) => {
    try {

        const post = await Post.findOne({slug: request.params.slug});

        if(!post) {
            const error = new Error("Post was not found");
            next(error);
            return;
        }

        const upload = uploadPicture.single("postPicture");

        const handleUpdatePostData = async (data) => {
            const { title, caption, slug, body } = JSON.parse(data);
            post.title = title || post.title;
            post.caption = caption || post.caption;
            post.slug = slug || post.slug;
            post.body = body || post.body;
            const updatedPost = await post.save();
            return response.json(updatedPost);
        }

        upload(request, response, async function (err) {
            if (err) {
                const error = new Error (
                    "An unknown error occurred when uploading: " + err.message    
                );
                next(error);
            } else {
                // everything went well
                if (request.file) {
                    let filename;
                    filename = post.photo;
                    if (filename) {
                        fileRemover(filename);
                    }
                    post.photo = request.file.filename;
                    handleUpdatePostData(request.body.document);
                } else {
                    let filename;
                    filename = post.photo;
                    post.photo = "";
                    fileRemover(filename);
                    handleUpdatePostData(request.body.document);
                }
            }
        });
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
// async function updatePostById(postId, updatedPostData){
//     return await Post.findByIdAndUpdate(postId, updatedPostData, { runValidators: true, returnDocument: 'after' }).exec()
// }

// DELETE
async function deletePostById(postId){
    return await Post.findByIdAndDelete(postId).exec()
}

// Export the functions for our routes to use.
module.exports = {
    createPost,
    updatePost,
    getAllPosts,
    getPostByTitle,
    getPostById,
    deletePostById,
    // updatePostById,
    // createNewPost
}