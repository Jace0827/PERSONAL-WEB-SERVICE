// Question Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const questionSchema = new Schema({
    title: { type: String, required: true, maxlength: 50 },
    summary: { type: String, required: true, maxlength: 140 },
    text: { type: String, required: true },
    tagIds: [{ type: Schema.Types.ObjectId, ref: 'Tag' }], // references tag model
    answerIds: [{ type: Schema.Types.ObjectId, ref: 'Answer' }], // references answer model
    askedBy: { type: String, required: true, default: 'Anonymous' },
    askedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
    askDateTime: { type: Date, default: Date.now },
    commentIds: [{ type: Schema.Types.ObjectId, ref: 'Comment' }], // references comment model
    views: { type: Number, default: 0 },
    upvotes: { type: Number, default: 0 },  
    downvotes: { type: Number, default: 0 }
}, {
    timestamps: true  // Mongoose uses this option to automatically add two new fields - createdAt and updatedAt
});

questionSchema.virtual('url').get(function () {
    return `/posts/question/${this._id}`;
});

const Question = mongoose.model('Question', questionSchema);

module.exports = { Question };
