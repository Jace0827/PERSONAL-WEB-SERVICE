const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    reputation: {
        type: Number,
        default: 0
    },
    questionIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Question'
    }],
    answerIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Answer'
    }],
    commentIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Comment'
    }],
    tagIds: [{
        type: Schema.Types.ObjectId,
        ref: 'Tag'
    }],
    isAdmin: {
        type: Boolean,
        default: false
    }
}, {
    timestamps: true  // Mongoose uses this option to automatically add two new fields - createdAt and updatedAt
});

const User = mongoose.model('User', userSchema);

module.exports = { User };
