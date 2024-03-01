/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const authorSchema = new mongoose.Schema({
  photo: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    maxlength: 30,
    required: true,
    trim: false,
    validate: {
      validator(value) {
        return /^[a-zA-Z]+$/.test(value);
      },
      message: (props) => `${props.value} is invalid Category Name`,
    },
  },
  lastName: {
    type: String,
    maxlength: 30,
    required: true,
    validate: {
      validator(value) {
        return /^[a-zA-Z]+$/.test(value);
      },
      message: (props) => `${props.value} is invalid Category Name`,
    },
  },
  dob: {
    type: Date,
    required: true,
  },
});

const author = mongoose.model('author', authorSchema);

module.exports = author;
