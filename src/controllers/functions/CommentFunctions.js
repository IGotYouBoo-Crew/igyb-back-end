const { Post } = require("../../models/PostModel")
const { Comment } = require("../../models/CommentModel")

const createComment = async (request, response, next) => {
    try {
        const {desc, slug, parent, replyOnUser} = request.body
        
        const post = await Post.findOne({slug: slug});

        if(!post) {
            const error = new Error("Post was not found");
            return next(error);
        }

        const newComment = new Comment({
            author: request.headers.userId,
            desc,
            post: post._id,
            parent,
            replyOnUser,
        });

        const savedComment = await newComment.save();
        return response.json(savedComment);
    } catch (error) {
        next(error)
    }
}

// Export the functions for our routes to use.
module.exports = {
    createComment,
}