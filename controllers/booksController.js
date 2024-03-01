const path = require("path");
const parentDir = path.resolve(__dirname, "..");
const booksModelPath = path.join(parentDir, "models", "BooksModel");
const Book = require(booksModelPath);
const userbooksModelPath = path.join(parentDir, "models", "UserBooksModel");
const UserBook = require(userbooksModelPath);
const asyncWrapper = require("../lib/asyncWrapper");
const CustomError = require("../lib/customError");
const handleValidationError = require("./../lib/customValidator");
const { text } = require("express");
const Authors = require('../models/authors');
const Categories = require('../models/categories');

//------------ adding new book ---------------
const addBook = async (req, res, next) => {
  const { author, category, name, description } = req.body

  if (cerror) {
    return next(new CustomError("author not found", 404));
  }
  if (!req.file) {
    return next(new CustomError('You must add a photo', 400));
  }

  const newBook = new Book({
    author,
    category,
    name,
    image: req.file.filename,
    description
  });
  const [err, book] = await asyncWrapper(newBook.save());

  if (err) {
    if (err.name === "ValidationError") {
      console.log("hii")
      return handleValidationError(err, next);
    }
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
const getBooks = async (req, res, next) => {
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  if (req.query.page) {
    const booksCount = await Book.countDocuments();
    if (skip >= booksCount)
      return next(new CustomError("No more books to view!", 404));
  }

  const [err, books] = await asyncWrapper(Book.find()
    .populate({ path: "author", select: "firstName lastName" })
    .skip(skip).limit(limit));


  for (let i = 0; i < books.length; i++) {
    try {
      const Rating = await calculateAvgRating(books[i]._id);
      books[i] = { ...books[i].toObject(), ...Rating };
    } catch (error) {
      return next(error);
    }
  }

  console.log(books)
  if (err) {
    return next(new CustomError("Error getting the books!", 500));
  }

  for (let i = 0; i < books.length; i++) {
    try {
      const Rating = await calculateAvgRating(books[i]._id);
      books[i] = { ...books[i].toObject(), ...Rating };
    } catch (err) {
      return next(new CustomError("Error getting the books!", 500));
    }
  }


  res.status(200).json({
    status: "success",
    data: {
      books,
    },
  });
};

const calculateAvgRating = async function (bookId) {
  const [err, ratings] = await asyncWrapper(
    UserBook.find({ book: bookId, rating: { $exists: true } }).select("rating")
  );

  if (err) {
    throw new CustomError("Error calculating average rating!", 500);
  }

  if (!ratings || ratings.length === 0) {
    return 0;
  }

  const totalRatings = ratings.reduce((acc, curr) => acc + curr.rating, 0);

  const avgRating = totalRatings / ratings.length;
  console.log(avgRating)

  return { totalRatings, avgRating }
};

// --------------- get book by id -----------------
const getBookById = async (req, res, next) => {
  const id = req.params.id;

  let [err, book] = await asyncWrapper(
    Book.findById(id)
      .populate({ path: "author", select: "firstName lastName" })
      .populate({ path: "category", select: "categoryName" })
      .exec()
  );
  try {
    const avgRating = await calculateAvgRating(book._id);
    book = { ...book.toObject(), avgRating };
  } catch (err) {
    return next(new CustomError("Error getting the book!", 500));
  }

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
  const [err, popularBooks] = await asyncWrapper(
    UserBook.aggregate([
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
        $limit: 8,
      },
    ])
  );

  if (err) {
    return next(new CustomError("Error getting popular books!", 500));
  }
  const bookIds = popularBooks.map((item) => item._id);
  const popularBooksDetails = await Book.find({ _id: { $in: bookIds } })
    .populate({ path: 'author', select: 'firstName lastName' })
    .populate({ path: 'category', select: 'categoryName' })
    .exec()

  for (let i = 0; i < popularBooksDetails.length; i++) {
    try {
      const avgRating = await calculateAvgRating(popularBooksDetails[i]._id);
      popularBooksDetails[i] = { ...popularBooksDetails[i].toObject(), avgRating };
    } catch (error) {
      return next(error);
    }
  }


  res.status(200).json({
    status: "success",
    data: {
      popularBooks: popularBooksDetails,
    },
  });
};

const searchBook = async (req, res, next) => {
  const { searchedBook } = req.query;

  const regex = new RegExp(searchedBook, "i");

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
  calculateAvgRating
};
