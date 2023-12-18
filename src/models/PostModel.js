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
        slug: {
            type:String, 
            required: true, 
            unique: true
        },
        body: {
            type: Object, 
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
    },
    { timestamps: true, toJSON: { virtuals: true } }
);

PostSchema.virtual('comments', {
    ref: "Comment",
    localField: '_id',
    foreignField: 'post'
});

const Post = mongoose.model("Post", PostSchema);
module.exports = { Post };
