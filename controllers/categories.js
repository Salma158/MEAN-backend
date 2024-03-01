/* eslint-disable linebreak-style */
const Categories = require('../models/categories');
const Book = require('../models/BooksModel');
const mongoose = require('mongoose');
const asyncWrapper = require('../lib/asyncWrapper');
const CustomError = require('../lib/customError');
const validateString = require('../lib/validateString');

const getAllCategories = async (req, res, next) => {
  const [err, categories] = await asyncWrapper(Categories.find({}));
  if (err) {
    return next(new CustomError('Error Getting The Categories Data', 400));
  }
  return res.json({ message: 'success', data: categories });
};

const createCategory = async (req, res, next) => {
  const categoryName = req.body;
  // if (!new validateString(categoryName)) {
  //   return res.status(400).json({ message: 'Invalid Category Name' });
  // }
  const [err, newCategory] = await asyncWrapper(Categories.create(categoryName));
  if (err) {
    return next(new CustomError(err.message, 400));
  }
  return res.json(newCategory);
};

const deleteCategory = async (req, res, next) => {
  const [err, categoryToDelete] = await asyncWrapper(Categories.findByIdAndDelete(req.params.id));
  if (!categoryToDelete) {
    return res.status(404).json({ message: 'Category ID Not Found' });
  }
  if (!err) {
    return next(new CustomError('Error Deleting The Category', 400));
  }
  res.status(200).json(categoryToDelete);
};

const updateCategory = async (req, res, next) => {
  const { categoryName } = req.body;
  const [err, categoryToUpdate] = await asyncWrapper(Categories.findById(req.params.id));
  if (!categoryToUpdate) {
    return res.status(404).json({ message: 'Category ID Not Found' });
  }

  if (!validateString(categoryName)) {
    return res.status(400).json({ error: 'Invalid Category Name' });
  }

  const [updateError, updatedCategory] = await asyncWrapper(Categories.findOneAndUpdate(
    { _id: req.params.id },
    { categoryName },
    { runValidators: true, new: true },
  ));
  console.log(updatedCategory)
  if (updateError) {
    return next(new CustomError('Error Updating The Category', 400));
  }
  return res.json(updatedCategory);
};


// getting books with the author of a specific category using pagination
const getCategoryBooks = async (req, res, next) => {
  const pageNumber = parseInt(req.query.pageNumber) || 0;
  const limitSize = parseInt(req.query.limitSize) || 4;
  const skip = pageNumber * limitSize;
  const [err, books] = await asyncWrapper(Book.find({ category: req.params.id }).select('name -_id')
    .populate({
      path: 'author',
      select: 'firstName lastName -_id'
    })
    .skip(skip)
    .limit(limitSize)
    .exec());
  if (err) {
    return next(new CustomError('Error Getting The Data', 400));
  }
  if (!books || books.length === 0) {
    return next(new CustomError('No books found for the specified category.', 400));
  }
  return res.status(200).json({ data: books });
};


const getPopularCategories = async (req, res, next) => {
  const [err, popularCategories] = await asyncWrapper(Book.aggregate([
    {
      $group: {
        _id: '$category',
        bookCount: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'categories',
        localField: '_id',
        foreignField: '_id',
        as: 'category',
      },
    },
    {
      $unwind: '$category',
    },
    {
      $project: {
        categoryName: '$category.categoryName',
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
    return next(new CustomError('Error Getting The Data', 400));
  }

  res.json({ popularCategories });

};

const getCategoryIdByName = async (req, res, next) => {
  const { categoryName } = req.params
  const [err, category] = await asyncWrapper(Categories.findOne({ categoryName }));
  if (err) {
    return next(err)
  }
  if (!category) {
    throw new Error('Category not found');
  }
  return category._id;
};

module.exports = {
  getAllCategories,
  getCategoryBooks,
  createCategory,
  deleteCategory,
  updateCategory,
  getPopularCategories,
  getCategoryIdByName
};
