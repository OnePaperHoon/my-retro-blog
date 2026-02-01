const mongoose = require('mongoose');

const visitorSchema = new mongoose.Schema({
  ip: {
    type: String
  },
  userAgent: {
    type: String
  },
  page: {
    type: String,
    default: '/'
  },
  referrer: {
    type: String
  },
  country: {
    type: String
  }
}, {
  timestamps: true
});

// Index for date-based queries
visitorSchema.index({ createdAt: -1 });
visitorSchema.index({ page: 1 });

module.exports = mongoose.model('Visitor', visitorSchema);
