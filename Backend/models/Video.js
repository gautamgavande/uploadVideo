const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  url: {
    type: String,
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Uploading', 'Converting', 'Completed'],
  },
  outputUrl: {
    type: String,
  },
  email: {
    type: String,
    
  },
}, { timestamps: true });

module.exports = mongoose.model('Video', videoSchema);
