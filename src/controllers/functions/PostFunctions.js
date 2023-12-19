// Require specific models so that we can 
// create functionality involving them.
const { uploadPicture } = require('../middleware/uploadPictureMiddleware');
const {fileRemover} = require('../../utils/fileRemover')
const { Post } = require('../../models/PostModel');
const { Comment } = require('../../models/CommentModel')

// import external packages
const {v4: uuidv4} = require('uuid');

// CREATE 

const createPost = async (request, response, next) => {
    try {
        const {title, caption, slug, body} = request.body
        const post = new Post({
            title,
            caption,
            slug: uuidv4(),
            body,
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

// DELETE
const deletePost = async (request, response, next) => {
    try {
        const post = await Post.findOneAndDelete({ slug: request.params.slug });

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
        const post = await Post.findOne({slug: request.params.slug}).populate([
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