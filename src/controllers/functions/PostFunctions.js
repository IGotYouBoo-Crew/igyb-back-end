// Require specific models so that we can 
// create functionality involving them.
const { Post } = require('../../models/PostModel');
const { Comment } = require('../../models/CommentModel');
const { populate } = require('dotenv');

// CREATE 

const createPost = async (request, response, next) => {
    try {
        const {title, caption, body, photo} = request.body
        const post = new Post({
            title,
            caption,
            body,
            photo,
            author: request.headers.userId
        });

        const createdPost = await post.save();
        return response.json(createdPost);
        
    } catch (error) {
        next(error);
    }
}

// UPDATE 

const updatePost = async (request, response, next) => {
    try {

        const post = await Post.findById(request.params.id);

        if(!post) {
            const error = new Error("Post was not found");
            next(error);
            return;
        } else {
            async function handleUpdatePostData(data) {
                const { title, caption, body, photo } = data;
                post.title = title || post.title;
                post.caption = caption || post.caption;
                post.body = body || post.body;
                post.photo = photo || post.photo;
                const updatedPost = await post.save();
                return response.json(updatedPost);
            }
    
            handleUpdatePostData(request.body);
        }

        
    } catch (error) {
        next(error);
    }
}

// DELETE
const deletePost = async (request, response, next) => {
    try {
        const postToDelete = await Post.findOneAndDelete({ _id: request.params.id });

        if(!postToDelete) {
            const error = new Error("Post was not found");
            return next(error);
        }

        await Comment.deleteMany({ post: postToDelete._id });

        return response.json({
            message: `Post: ${postToDelete.title} has been successfully deleted`,
        })
    } catch (error) {
        next(error);
    }
}

// READ
const getPost = async (request, response, next) => {
    try {
        const post = await Post.findById(request.params.id).populate([
            {
                path: 'author',
                select: ['username', 'profilePicture'],
            },
            {
                path: 'comments',
                match: {
                    parentComment: null,
                },
                populate: [
                    {
                        path: 'author',
                        select: ['username', 'profilePicture']
                    },                    
                ],            
            },
        ]);

        if(!post) {
            const error = new Error("Post was not found");
            return next(error);
        }

        return response.json(post);
    } catch (error) {
        next(error);
    }
}

const getAllPosts = async (request, response, next) => {
    try {
        const posts = await Post.find({}).populate([
            {
                path: "author",
                select: ['username', 'profilePicture']
            }
        ]);

        response.json(posts);
    } catch (error) {
        next(error);
    }
}

// Export the functions for our routes to use.
module.exports = {
    createPost,
    updatePost,
    deletePost,
    getPost,
    getAllPosts,
}
