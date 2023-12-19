// Require specific models so that we can 
// create functionality involving them.
const { Post } = require("../../models/PostModel")
const { Comment } = require("../../models/CommentModel")

// CREATE 

const createComment = async (request, response, next) => {
    try {
        const {desc, parentPostId, parentComment, replyOnUser} = request.body
        
        const findPost = await Post.findById(parentPostId);

        if(!findPost) {
            const error = new Error("Post was not found");
            return next(error);
        }

        const newComment = new Comment({
            author: request.headers.userId,
            desc,
            parentPostId: parentPostId,
            parentComment,
            replyOnUser,
            date: Date.now(),
        });

        const savedComment = await newComment.save();
        return response.json(savedComment);
    } catch (error) {
        next(error)
    }
}

// UPDATE 

const updateComment = async (request, response, next) => {
    try {

        const comment = await Comment.findById(request.params.id);

        if(!comment) {
            const error = new Error("Comment was not found");
            next(error);
            return;
        } else {
            async function handleUpdateCommentData(data) {
                const { desc} = data;
                comment.desc = desc || comment.desc;
                const updatedComment = await comment.save();
                return response.json(updatedComment);
            }
    
            handleUpdateCommentData(request.body);
        }

        
    } catch (error) {
        next(error);
    }
}

// DELETE
const deleteComment = async (request, response, next) => {
    try {
        const commentToDelete = await Comment.findOneAndDelete({ _id: request.params.id });

        if(!commentToDelete) {
            const error = new Error("Comment was not found");
            return next(error);
        }

        await Comment.deleteMany({ comment: commentToDelete._id });

        return response.json({
            message: `Comment: ${commentToDelete.id} has been successfully deleted`,
        })
    } catch (error) {
        next(error);
    }
}

// Export the functions for our routes to use.
module.exports = {
    createComment,
    updateComment,
    deleteComment
}