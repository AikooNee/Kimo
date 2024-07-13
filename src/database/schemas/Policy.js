const mongoose = require('mongoose');

const PolicySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true
  },
  accepted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('Policy', PolicySchema);