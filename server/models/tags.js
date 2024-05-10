// Tag Document Schema
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const tagSchema = new Schema({
  name: { type: String, required: true },
  createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, {
  timestamps: true  // Mongoose uses this option to automatically add two new fields - createdAt and updatedAt
});

tagSchema.virtual('url').get(function () {
  return `/posts/tag/${this._id}`;
});

const Tag = mongoose.model('Tag', tagSchema);

module.exports = { Tag };
