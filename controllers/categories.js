/* eslint-disable linebreak-style */
const Categories = require('../models/categories');
const Book = require('../models/BooksModel');
const mongoose = require('mongoose');
const asyncWrapper = require('../lib/asyncWrapper');

const validateCategoryName = (categoryName) => {
  if (!categoryName || categoryName.trim() === '') {
    return false;
  }
  return true;
};

const getAllCategories = async (req, res, next) => {
  const [err, categories] = await asyncWrapper(Categories.find({}).select('categoryName -_id'));
  if (categories.length === 0) {
    return res.status(404).json({ message: 'No data found' });
  }
  if (err) {
    return next(err);
  }
  return res.json({ message: 'success', data: categories });
};

const createCategory = async (req, res, next) => {
  const category = req.body;
  if (!validateCategoryName(category.categoryName)) {
    return res.status(400).json({ message: 'Invalid Category Name' });
  }
  const [err, newCategory] = await asyncWrapper(Categories.create(category));
  if (err) {
    return next(err);
  }
  return res.json(newCategory);
};

const deleteCategory = async (req, res, next) => {
  const [err, categoryToDelete] = await asyncWrapper(Categories.findByIdAndDelete(req.params.id));
  if (!categoryToDelete) {
    return res.status(404).json({ message: 'Category ID Not Found' });
  }
  if (!err) {
    res.json(categoryToDelete);
  }
  return next(err);
};

const updateCategory = async (req, res, next) => {
  const { categoryName } = req.body;
  const [err, categoryToUpdate] = await asyncWrapper(Categories.findById(req.params.id));
  if (!categoryToUpdate) {
    return res.status(404).json({ message: 'Category ID Not Found' });
  }

  if (!validateCategoryName(categoryName)) {
    return res.status(400).json({ error: 'Invalid Category Name' });
  }

  const [updateError, updatedCategory] = await asyncWrapper(Categories.findOneAndUpdate(
    { _id: req.params.id },
    { categoryName },
    { runValidators: true, new: true },
  ));

  if (!updateError) {
    return res.json(updatedCategory);
  }

  return next(updateError);
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
    return next(err);
  }
  if (!books || books.length === 0) {
    return res.status(404).json({ message: 'No books found for the specified category.' });
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
          throw next(err);
      }

      res.json({ popularCategories });
  
};


module.exports = {
  getAllCategories,
  getCategoryBooks,
  createCategory,
  deleteCategory,
  updateCategory,
  getPopularCategories,
};
