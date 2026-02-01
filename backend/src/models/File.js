const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['file', 'folder'],
    required: true
  },
  content: {
    type: String,
    default: ''
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'File',
    default: null
  },
  path: {
    type: String,
    required: true
  },
  icon: {
    type: String
  },
  size: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index for faster path lookups
fileSchema.index({ path: 1 });
fileSchema.index({ parentId: 1 });

module.exports = mongoose.model('File', fileSchema);
