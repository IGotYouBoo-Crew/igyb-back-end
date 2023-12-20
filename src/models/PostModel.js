const mongoose = require("mongoose");
const dayjs = require('dayjs');

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

// Middleware to format the date before saving
PostSchema.pre('save', function (next) {
    // No need to format the date before saving, Mongoose will handle it
    next();
});

// Getter to format the date when retrieving the document
PostSchema.set('toObject', { getters: true });
PostSchema.set('toJSON', { getters: true });

PostSchema.path('date').get(function (value) {
    return dayjs(value).format('DD-MM-YYYY');
});

const Post = mongoose.model("Post", PostSchema);
module.exports = { Post };
