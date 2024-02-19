const path = require("path");
const parentDir = path.resolve(__dirname, "..");
const booksModelPath = path.join(parentDir, "models", "BooksModel");
const Book = require(booksModelPath);
const asyncWrapper = require("./../lib/asyncWrapper");
const CustomError = require("./../errors/customError");

//------------ adding new book ---------------
const addBook = async (req, res, next) => {
  const newBook = new Book(req.body);
  const [err, book] = await asyncWrapper(newBook.save());

  if (err) {
    return next(new CustomError("Error adding the book!", 500));
  }

  res.status(201).json({
    status: "success",
    data: {
      book,
    },
  });
};

// -------------- editing a book -------------
const editBook = async (req, res) => {
  req.body.updatedAt = new Date();
  const [err, updatedBook] = await asyncWrapper(
    Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
  );

  if (err) {
    return next(new CustomError("Error updating the book!", 500));
  }

  res.status(200).json({
    status: "success",
    data: {
      updatedBook,
    },
  });
};

// -------------- delete a book ----------------
const deleteBook = async (req, res) => {
  const [err] = await asyncWrapper(Book.findByIdAndDelete(req.params.id));

  if (err) {
    return next(new CustomError("Error deleting the book!", 500));
  }
  res.sendStatus(204);
};

//------------ get all books or based on the category --------------
const getBooks = async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;
  const category = req.query.category;

  if (req.query.page) {
    const booksCount = await Book.countDocuments();
    if (skip >= booksCount)
      return next(new CustomError("No more books to view!", 404));
  }

  const [err, books] = await asyncWrapper(
    category
      ? Book.find({ category: category }).skip(skip).limit(limit)
      : Book.find().skip(skip).limit(limit)
  );

  if (err) {
    return next(new CustomError("Error getting the books!", 500));
  }
  res.status(200).json({
    status: "success",
    data: {
      books,
    },
  });
};

// --------------- get book by id -----------------
const getBookById = async (req, res, next) => {
  const id = req.params.id * 1;

  const [err, book] = await booksModel
    .findById(id)
    .populate({ path: "category", select: "---" })
    .populate({ path: "auhtor", select: "----" })
    .exec();
  if (err) {
    return next(new CustomError("Error getting the book!", 500));
  }
  res.status(200).json({
    status: "success",
    data: {
      book,
    },
  });
};


// body checking : not specified properties
// most popular books
// search for book

module.exports = {
  addBook,
  editBook,
  deleteBook,
  getBooks,
  getBookById,
};
