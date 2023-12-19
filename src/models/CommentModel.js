const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema(
    {
        author: {
            type: mongoose.Types.ObjectId, 
            ref: 'User', 
            required: true
        },
        desc: {
            type: String, 
            required: true
        },
        parentPostId: {
            type: mongoose.Types.ObjectId, 
            ref: 'Post', 
            required: true
        },
        parentComment: {
            type: mongoose.Types.ObjectId, 
            ref: 'Comment', 
            default: null
        },
        replyOnUser: {
            type: mongoose.Types.ObjectId, 
            ref: 'User', 
            default: null,
        },
    },
    { timestamps: true, toJSON: { virtuals:true } }
);

CommentSchema.virtual('replies', {
    ref: "Comment",
    localField: '_id',
    foreignField: 'parentComment'
});

const Comment = mongoose.model("Comment", CommentSchema);
module.exports = { Comment };
