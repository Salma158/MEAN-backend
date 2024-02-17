const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema({
  //authorId: { type: mongoose.Types.ObjectId, ref: 'Author', required: [true, "please specify the auther id"] },
  //categoryId: { type: mongoose.Types.ObjectId, ref: 'Category', required: [true, "please specify the category id"]},
  name: { type: String, trim: true, maxlength: 50, minLength: 3, required: [true, "please specify the book name"]},
  image: { type: String, trim: true },
  description: { type: String, trim: true, minLength:100, maxlength:500
    //required: [true, "please specify the description of the book , at least 100 characters"]},
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Book = mongoose.model("Book", bookSchema);
module.exports = Book;