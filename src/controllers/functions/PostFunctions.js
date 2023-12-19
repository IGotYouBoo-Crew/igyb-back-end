// Require specific models so that we can 
// create functionality involving them.
const { Post } = require('../../models/PostModel');
const { Comment } = require('../../models/CommentModel')

// import external packages
// const {v4: uuidv4} = require('uuid');

// CREATE 

const createPost = async (request, response, next) => {
    try {
        const {title, caption, body, photo} = request.body
        const post = new Post({
            title,
            caption,
            body,
            photo,
            author: request.headers.userId,
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

        const post = await Post.findOne({id: request.params._id});

        if(!post) {
            const error = new Error("Post was not found");
            next(error);
            return;
        } else {
            const handleUpdatePostData = async (data) => {
                const { title, caption, body, photo } = JSON.parse(data);
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
        const post = await Post.findOneAndDelete({ id: request.params._id });

        if(!post) {
            const error = new Error("Post was not found");
            return next(error);
        }

        await Comment.deleteMany({ post: post._id });

        return response.json({
            message: "Post is successfully deleted",
        })
    } catch (error) {
        next(error);
    }
}

// READ
const getPost = async (request, response, next) => {
    try {
        const post = await Post.findOne({id: request.params._id}).populate([
            {
                path: 'author',
                select: ["username"],
            },
            {
                path: 'comments',
                match: {
                    parent: null,
                },
                populate: [
                    {
                        path: 'author',
                        select: ['username']
                    },
                    {
                        path: 'replies'
                    }
                ]            
            }
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
                select: ["username"]
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