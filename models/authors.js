/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  photo: {
    type: String,
  },
  firstName: {
    type: String,
    required: true,
    trim: false,
  },
  lastName: {
    type: String,
    required: true,
  },
  dob: {
    type: Date,
    required: true,
  },
});

const author = mongoose.model('authors', authorSchema);

module.exports = author;
