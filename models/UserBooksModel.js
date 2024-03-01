const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userBookSchema = new Schema({
  user: { 
    type: mongoose.Types.ObjectId, 
    ref: "Users", 
    required: [true, "Please specify the user id"] ,
    validate: {
      validator: async function(id) {
        const user = await mongoose.model("Users").findById(id);
        return user !== null;
      },
      message: props => `User with id ${props.value} does not exist`
    }
  },
  book: { 
    type: mongoose.Types.ObjectId, 
    ref: "Book", 
    required: [true, "Please specify the book id"], 
    validate: {
      validator: async function(id) {
        const book = await mongoose.model("Book").findById(id);
        return book !== null;
      },
      message: props => `Book with id ${props.value} does not exist`
    }
  },
  status: {
    type: String,
    enum: ["already read", "currently reading", "wish to read"],
    default: "wish to read"
  },
  rating: { 
    type: Number,
    min: [1, "Rating must be at least 1"],
    max: [5, "Rating cannot be more than 5"],
  },
  review: { 
    type: String,
    maxlength: [500, "Review cannot exceed 500 characters"],
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const UserBook = mongoose.model("UserBook", userBookSchema);

module.exports = UserBook;
