/* eslint-disable linebreak-style */
const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  categoryName: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator(value) {
        return /^[a-zA-Z]+$/.test(value);
      },
      message: (props) => `${props.value} is invalid Category Name`,
    },
  },
});

const category = mongoose.model('category', categorySchema);

module.exports = category;
