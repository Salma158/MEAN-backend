/* eslint-disable linebreak-style */
const Authors = require('../models/authors');
const asyncWrapper = require('../lib/asyncWrapper');
const Book = require('../models/BooksModel');
const CustomError = require('../lib/customError');
const validateString = require('../lib/validateString');
const booksController = require('./booksController')
const UserBook = require('../models/UserBooksModel');


// get authors using pagination
const getAllAuthors = async (req, res, next) => {
  const pageNumber = parseInt(req.query.pageNumber, 10) || 0;
  const limitSize = parseInt(req.query.limitSize, 10) || 4;
  const skip = pageNumber * limitSize;
  const [err, authors] = await asyncWrapper(Authors.find({}))
    .skip(skip)
    .limit(limitSize)
    .exec());
  if (authors.length === 0) {
    return next(new CustomError("No Data Found!", 404));
  }
  if (err) {
    return next(new CustomError("Error Getting All Authors Data", 500));
  }
  return res.json({ message: 'success', data: authors });
};


const createAuthor = async (req, res, next) => {
  const { firstName, lastName, dob } = req.body;
  if (!req.file) {
    return next(new CustomError('You must add a photo', 400));
  }
  const dateOfBirth = new Date(dob);
  const newAuthor = {
    firstName,
    lastName,
    dob: dateOfBirth,
    photo: req.file.filename
  };
  const [err, author] = await asyncWrapper(Authors.create(newAuthor));
  if (!validateString(req.body.firstName)) {
    return next(new CustomError("No First Name Entered", 400));
  }
  if (!validateString(req.body.lastName)) {
    return next(new CustomError("No Last Name Entered", 400));
  }
  if (!validateString(req.body.dob)) {
    return next(new CustomError("No Date Of Birth Entered", 400));
  }
  if (err) {
    return next(new CustomError(err.message, 404));
  }
  return res.status(201).json({ message: 'success', data: author });
};

const deleteAuthor = async (req, res, next) => {
  const [err, authorToDelete] = await asyncWrapper(Authors.findByIdAndDelete(req.params.id));
  if (!authorToDelete) {
    return next(new CustomError("Author Not Found!", 404));
  }
  if (err) {
    return next(new CustomError("Error Deleting The Author", 500));
  }
  res.status(200).json(authorToDelete);
};

const updateAuthor = async (req, res, next) => {
  const { firstName, lastName, dob } = req.body;
  const [err, authorToUpdate] = await asyncWrapper(Authors.findById(req.params.id));
  if (!authorToUpdate) {
    return next(new CustomError("Author Not Found!", 404));
  }
  if (err) {
    return next(new CustomError("Error Finding The Author", 500));
  }

  const [updateError, updatedAuthor] = await asyncWrapper(Authors.findOneAndUpdate(
    { _id: req.params.id },
    { firstName, lastName, dob },
    { runValidators: true },
  ));
  if (updateError) {
    return next(new CustomError("Error Updating The Author", 500));
  }
  return res.status(200).json(updatedAuthor);
};

const getAuthorDetails = async (req, res, next) => {
  try {
    const authorId = req.params.id;
    const [foundError, authorDetails] = await asyncWrapper(Authors.findById(authorId, 'firstName lastName dob'));
    if (foundError) {
      throw new CustomError("Error Finding The Author", 500);
    }
    if (!authorDetails) {
      throw new CustomError("Author Not Found!", 404);
    }

    const books = await Book.find({ author: authorId }, 'name');
    const userBooks = await UserBook.find({ book: { $in: books.map(book => book._id) } });

    const bookStatusMap = new Map();
    userBooks.forEach(userBook => {
      bookStatusMap.set(userBook.book.toString(), userBook.status);
    });

    const booksWithStatus = [];
    for (let i = 0; i < books.length; i++) {
      const book = books[i];
      const status = bookStatusMap.get(book._id.toString()) || 'wish to read';

      let ratingDetails;
      try {
        ratingDetails = await booksController.calculateAvgRating(book._id);
      } catch (err) {
        return next(new CustomError("Error getting book ratings", 500));
      }

      const bookWithDetails = {
        _id: book._id,
        name: book.name,
        status: status,
        ratingDetails: ratingDetails
      };

      booksWithStatus.push(bookWithDetails);
    }

    return res.status(200).json({ author: authorDetails, books: booksWithStatus });
  } catch (error) {
    return next(error);
  }
};


const getPopularAuthors = async (req, res, next) => {
  const [err, popularAuthors] = await asyncWrapper(Book.aggregate([
    {
      $group: {
        _id: '$author',
        bookCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'authors',
        localField: '_id',
        foreignField: '_id',
        as: 'author',
      },
    },
    {
      $unwind: '$author',
    },
    {
      $project: {
        firstName: '$author.firstName',
        bookCount: 1,
      },
    },
    {
      $sort: { bookCount: -1 },
    },
    {
      $limit: 3,
    },
  ]));

  if (err) {
    return next(new CustomError("Error Finding The Popular Authors", 500));
  }

  res.status(200).json({ popularAuthors });
}

module.exports = {
  getAllAuthors,
  createAuthor,
  deleteAuthor,
  updateAuthor,
  getPopularAuthors,
  getAuthorDetails
};
