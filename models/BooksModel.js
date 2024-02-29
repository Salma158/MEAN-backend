const mongoose = require("mongoose");
const { isURL } = require("validator");

const bookSchema = new mongoose.Schema({
  author: { 
    type: mongoose.Types.ObjectId, 
    ref: 'author', 
    required: [true, "Please specify the author id"],
    validate: {
      validator: async function(id) {
        const author = await mongoose.model('authors').findById(id);
        return author !== null;
      },
      message: props => `Author with id ${props.value} does not exist`
    }
  },
  category: { 
    type: mongoose.Types.ObjectId, 
    ref: 'category', 
    required: [true, "Please specify the category id"],
    validate: {
      validator: async function(id) {
        const category = await mongoose.model('categories').findById(id);
        return category !== null;
      },
      message: props => `Category with id ${props.value} does not exist`
    }
  },
  name: { 
    type: String, 
    trim: true, 
    maxlength: 50, 
    minlength: 3, 
    required: [true, "Please specify the book name"], 
    unique: [true, "Book with this name already exists!"] 
  },
  image: { 
    type: String, 
   // required: [true , "Please specify image for the book"],
    validate: {
      validator: function(v) {
        return isURL(v);
      },
      message: props => `${props.value} is not a valid URL for the image`
    }
  },
  description: { 
    type: String, 
    trim: true, 
    minlength: 10, 
    maxlength: 500, 
    required: [true, "Please specify the description of the book, at least 10 characters"] 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});


const Book = mongoose.model("Book", bookSchema);
module.exports = Book;
