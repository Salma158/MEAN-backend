const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  author: { type: mongoose.Types.ObjectId, ref: 'author', required: [true, "please specify the auther id"] },
  category: { type: mongoose.Types.ObjectId, ref: 'category', required: [true, "please specify the category id"]},
  name: { type: String, trim: true, maxlength: 50, minlength: 3, required: [true, "please specify the book name"], unique: true },
  image: { type: String },
  description: { type: String, trim: true, minlength: 5, maxlength: 500, required: [true, "please specify the description of the book, at least 100 characters"] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;
