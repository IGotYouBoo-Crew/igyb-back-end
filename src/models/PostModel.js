const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema(
    {
        title: {
            type: String, 
            required: true
        },
        caption: {
            type: String, 
            required: true
        },
        body: {
            type: String, 
            required: true
        },
        photo: {
            type: String, 
            required: false
        },
        author: {
            type: mongoose.Types.ObjectId, 
            ref: 'User'
        },
        date: {
            type: Date,
            required: true,
            default: new Date(Date.now())
        },
    },
    { timestamps: true, toJSON: { virtuals: true } }
);

PostSchema.virtual('comments', {
    ref: "Comment",
    localField: '_id',
    foreignField: 'parentPostId'
});

const Post = mongoose.model("Post", PostSchema);
module.exports = { Post };
