const mongoose = require('mongoose');

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  contactNumber: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  },
  songs: [{
    type: String
  }]
}, {
  timestamps: true
});

module.exports = mongoose.model('Artist', artistSchema);
