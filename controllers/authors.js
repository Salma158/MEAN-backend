/* eslint-disable linebreak-style */
const Authors = require('../models/authors');
const asyncWrapper = require('../lib/asyncWrapper');
const Book = require('../models/BooksModel');
const CustomError = require('../lib/customError');

const validateString = (data) => {
  if (!data || data.trim() === '') {
    return false;
  }
  return true;
};

// get author using pagination
const getAllAuthors = async (req, res, next) => {
  const pageNumber = parseInt(req.query.pageNumber, 10) || 0;
  const limitSize = parseInt(req.query.limitSize, 10) || 4;
  const skip = pageNumber * limitSize;
  const [err, authors] = await asyncWrapper(Authors.find({}).select('firstName lastName -_id')
    .skip(skip)
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

const createAuthor = async (req, res, next) => {
  // if(! validateString(req.body.firstName)){
  //   return res.status(400).json({ message: 'Invalid First Name' });
  // }
  // if(! validateString(req.body.lastName)){
  //   return res.status(400).json({ message: 'Invalid Last Name' });
  // }
  // if(! validateString(req.body.dob)){
  //   return res.status(400).json({ message: 'Invalid Date Of Birth' });
 // }
  const authorData = req.body;
  const photoFullPath = (`${req.protocol}://${req.get('host')}/authors/${req.file.filename}`);
  const [err, newAuthor] = await asyncWrapper(Authors.create({
      firstName: authorData.firstName,
      lastName: authorData.lastName,
      dob: authorData.dob,
      photo: photoFullPath
    }
    ));
  if (err) {
    return next(new CustomError(err.message, 400));
  }
  return res.status(201).json({ message: 'success', data: newAuthor });

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
  const [err, authorToUpdate] = await asyncWrapper(Authors.findById(req.params.id));
  if (!authorToUpdate) {
    return res.status(404).json({ message: 'Author ID Not Found' });
  }
  if (err) {
    return next(updateError);
  }
  if(! validateString(req.body.firstName)){
    return res.status(400).json({ message: 'Invalid First Name' });
  }
  if(! validateString(req.body.lastName)){
    return res.status(400).json({ message: 'Invalid Last Name' });
  }
  if(! validateString(req.body.dob)){
    return res.status(400).json({ message: 'Invalid Date Of Birth' });
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

const getAuthorDetails = async (req, res, next) => {
  // const [error, authorBooks] = await asyncWrapper(Book.find({ _id: req.params.AuthorId })
  // .select('name -_id')
  // );
  // if (error) {
  //   return next(error);
  // }
  // return res.json({ data: authorBooks });

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
      throw next(err);
  }

  res.json({ popularAuthors });
}

module.exports = {
  getAllAuthors,
  createAuthor,
  deleteAuthor,
  updateAuthor,
  getPopularAuthors,
  getAuthorDetails,
};
