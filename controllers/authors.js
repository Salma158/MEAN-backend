/* eslint-disable linebreak-style */
const Authors = require('../models/authors');
const asyncWrapper = require('../lib/asyncWrapper');
const Books = require('../models/BooksModel');
const CustomError = require('../lib/customError');

// get author using pagination
const getAllAuthors = async (req, res, next) => {
  const pageNumber = parseInt(req.query.pageNumber, 10) || 0;
  const limitSize = parseInt(req.query.limitSize, 10) || 4;
  const skip = pageNumber * limitSize;
  const authorsCount = await Authors.countDocuments();
  if (skip >= authorsCount) {
    return next(new CustomError('No More Authors To Display', 404));
  }
  const [err, authors] = await asyncWrapper(Authors.find({}).select('firstName lastName -_id')
    .skip((pageNumber) * limitSize)
    .limit(limitSize)
    .exec());
  if (authors.length === 0) {
    return res.status(404).json({ message: 'No data found' });
  }
  if (err) {
    return next(err);
  }
  return res.json({ message: 'success', data: authors });
};

const createAuthor = async (req, res) => {
  const author = req.body;
  const [err, newAuthor] = await asyncWrapper(Authors.create(author));
  if (err) {
    return next(err);
  }
  return res.json(newAuthor);
};

const deleteAuthor = async (req, res, next) => {
  const [err, authorToDelete] = await asyncWrapper(Authors.findByIdAndDelete(req.params.id));
  if (!authorToDelete) {
    return res.status(404).json({ message: 'Author ID Not Found' });
  }
  if (!err) {
    res.json(authorToDelete);
  }
  return next(err);
};

const updateAuthor = async (req, res, next) => {
  const { firstName, lastName, dob } = req.body;
  const authorToUpdate = await asyncWrapper(Authors.findById(req.params.id));
  if (!authorToUpdate[1]) {
    return res.status(404).json({ message: 'Author ID Not Found' });
  }

  const [updateError, updatedAuthor] = await asyncWrapper(Authors.findOneAndUpdate(
    { _id: req.params.id },
    { firstName, lastName, dob },
    { runValidators: true },
  ));
  if (!updateError) {
    return res.json(updatedAuthor);
  }

  return next(updateError);
};

const getAllAuthorsBooks = async (req, res, next) => {
  const [error, authorBooks] = await asyncWrapper(Books.find({ _id: req.params.AuthorId }));
  if (error) {
    return next(error);
  }
  return res.json({ data: authorBooks });
};

// Popular Author

module.exports = {
  getAllAuthors,
  createAuthor,
  deleteAuthor,
  updateAuthor,
  // popularAuthor,
  getAllAuthorsBooks,
};
