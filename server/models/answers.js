// Answer Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const answerSchema = new Schema({
  text: { type: String, required: true },
  answeredBy: { type: String, required: true, default: 'Anonymous' },
  answeredUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  askedUserId: { type: Schema.Types.ObjectId, ref: 'User' },
  answeredDateTime: { type: Date, default: Date.now },
  questionIds: { type: Schema.Types.ObjectId, ref: 'Question', required: true }, // references Question model
  commentIds: [{ type: Schema.Types.ObjectId, ref: 'Comment' }], // references Comment model
}, {
  timestamps: true  // Mongoose uses this option to automatically add two new fields - createdAt and updatedAt
});

answerSchema.virtual('url').get(function () {
  return `/posts/answer/${this._id}`;
});

answerSchema.method('upvote', function() {
  this.upvotes++; 
});

answerSchema.method('downvote', function() {
  this.downvotes++; 
});

const Answer = mongoose.model('Answer', answerSchema);

module.exports = { Answer };
