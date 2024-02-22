const path = require("path");
const parentDir = path.resolve(__dirname, "..");
const booksModelPath = path.join(parentDir, "models", "BooksModel");
const Book = require(booksModelPath);
const userbooksModelPath = path.join(parentDir, "models", "UserBooksModel");
const UserBook = require(userbooksModelPath)
const asyncWrapper = require("../lib/asyncWrapper");
const CustomError = require("./../lib/customError");


//------------ adding new book ---------------
const addBook = async (req, res, next) => {
  const { author, category, name, description } = req.body
  const photoFullPath = `${req.protocol}://${req.get('host')}images/books/${req.file.filename}`;
  const newBook = new Book({
    author,
    category,
    name,
    image: photoFullPath,
    description
  });
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

//------------ get all books --------------
const getBooks = async (req, res) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  if (req.query.page) {
    const booksCount = await Book.countDocuments();
    if (skip >= booksCount)
      return next(new CustomError("No more books to view!", 404));
  }

  const [err, books] = await asyncWrapper(Book.find().skip(skip).limit(limit));

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
  const id = req.params.id;

  const [err, book] = await asyncWrapper(Book.findById(id))
    .populate({ path: "category", select: "categoryName" })
    .populate({ path: "auhtor", select: "firstName lastName" })
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

const getPopularBooks = async (req, res, next) => {
  const popularBooks = asyncWrapper(await UserBook.aggregate([
    {
      $match: {
        status: "already read",
      },
    },
    {
      $group: {
        _id: "$book",
        count: { $sum: 1 },
      },
    },
    {
      $sort: {
        count: -1,
      },
    },
    {
      $limit: 20,
    },
  ]));

  const bookIds = popularBooks.map((item) => item._id);
  const popularBooksDetails = await Book.find({ _id: { $in: bookIds } });

  res.status(200).json({
    status: "success",
    data: {
      popularBooks: popularBooksDetails,
    },
  });
};

const searchBook = async (req, res, next) => {
  const { searchedBook } = req.query;

  const regex = new RegExp(searchedBook, 'i');

  const [err, books] = await asyncWrapper(
    Book.find({ name: { $regex: regex } })
  );

  if (err) {
    return next(new CustomError("Error searching for the book!", 500));
  }

  res.status(200).json({
    status: "success",
    data: {
      books,
    },
  });
};

module.exports = {
  addBook,
  editBook,
  deleteBook,
  getBooks,
  getBookById,
  searchBook,
  getPopularBooks,
};
