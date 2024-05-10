const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const commentSchema = new Schema({
    text: { type: String, required: true, maxlength: 140 }, 
    commentedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    commentedOn: { type: Schema.Types.ObjectId, required: true, refPath: 'onModel' }, 
    onModel: { type: String, required: true, enum: ['Question', 'Answer'] },
    upvotes: { type: Number, default: 0 } 
}, {
    timestamps: true  // Mongoose uses this option to automatically add two new fields - createdAt and updatedAt
});

const Comment = mongoose.model('Comment', commentSchema);

module.exports = { Comment };
