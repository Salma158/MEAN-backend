/* eslint-disable linebreak-style */
const Categories = require('../models/categories');
const Books = require('../models/BooksModel');
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
  const { categoryName } = req.body.categoryName;
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

// const page = parseInt(req.query.page, 10) || 0;
// const booksPerPage = 4;
const getCategoryBooks = async (req, res, next) => {
  const [err, books] = await asyncWrapper(Books.find({ category: req.params.id }).populate({
    path: 'Author',
    select: 'firstName',
  }).exec());

  if (err) {
    return next(err);
  }

  return res.json({ data: books });
};

const getPopularCategories = async (req, res, next) => {
  try {
    const popularCategories = await Books.aggregate([
      {
        $group: {
          _id: '$category',
          bookCount: { $sum: 1 }, // Count the number of books in each category
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
          bookCount: 1, // Include the bookCount field
        },
      },
      {
        $sort: { bookCount: -1 },
      },
    ]);

    res.json({ popularCategories });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllCategories,
  getCategoryBooks,
  createCategory,
  deleteCategory,
  updateCategory,
  getPopularCategories,
};
