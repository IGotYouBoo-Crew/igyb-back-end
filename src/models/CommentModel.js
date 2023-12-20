const mongoose = require("mongoose");
const dayjs = require('dayjs');


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
        date: {
            type: Date,
            required: true,
            default: Date.now()
        },
    }
);

// Middleware to format the date before saving
CommentSchema.pre('save', function (next) {
    // No need to format the date before saving, Mongoose will handle it
    next();
});

// Getter to format the date when retrieving the document
CommentSchema.set('toObject', { getters: true });
CommentSchema.set('toJSON', { getters: true });

CommentSchema.path('date').get(function (value) {
    return dayjs(value).format('DD-MM-YYYY');
});

const Comment = mongoose.model("Comment", CommentSchema);
module.exports = { Comment };
