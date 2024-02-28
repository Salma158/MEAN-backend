const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userBookSchema = new Schema({
  user: { type: mongoose.Types.ObjectId, ref: "Users", required: true },
  book: { type: mongoose.Types.ObjectId, ref: "Book", required: true },
  status: {
    type: String,
    enum: ["already read", "currently reading", "wish to read"],
    required: true,
  },
  rating: { type: Number },
  review: { type: String },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

const UserBook = mongoose.model("UserBook", userBookSchema);

module.exports = UserBook;
