const mongoose = require("mongoose");
const dayjs = require('dayjs');
var localizedFormat = require('dayjs/plugin/localizedFormat')
dayjs.extend(localizedFormat)

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
    }
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
    return dayjs(value).format('ll');
});

const Post = mongoose.model("Post", PostSchema);
module.exports = { Post };
