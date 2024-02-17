const path = require('path');
const parentDir = path.resolve(__dirname, '..');
const booksModelPath = path.join(parentDir, 'models', 'BooksModel');
const Book = require(booksModelPath);
const asyncWrapper = require("./../lib/asyncWrapper");

const addBook = async (req, res) => {
  const newBook = new Book(req.body)
  const [err, book] = await asyncWrapper(newBook.save())

  if (err) {
    return res.status(400).send(err.message)
  }

  res.status(201).json({
    status: "success",
    data: {
      book,
    },
  });
};

const editBook = async (req, res) => {
  req.body.updatedAt = new Date();
  const [err, updatedBook] = await asyncWrapper(
    Book.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
  );

  if (err) {
    return res.status(400).send(err.message)
  }
  res.status(200).json({
    status: "success",
    data: {
      updatedBook,
    },
  });
};

const deleteBook = async (req, res) => {
  const [err] = await asyncWrapper(Book.findByIdAndDelete(req.params.id))

  if (err) {
    return res.status(500).send(err.message);
  }
  res.sendStatus(204);
};

// apply pagination
const getBooks = async (req, res) => {
  const page = req.query.page * 1 || 1
  const limit = req.query.limit * 1 || 20
  const skip = (page - 1) * limit
  const category = req.query.category;

  if(req.query.page){
    const booksCount = await Book.countDocuments()
    if(skip >= booksCount) return res.status(500).send("saad :(")
  }

  const [err, books] = await asyncWrapper(
    category
      ? Book.find({ category: category }).skip(skip).limit(limit)
      : Book.find().skip(skip).limit(limit)
  )

  if (err) {
    return res.status(500).send(err.message)
  }
  res.status(200).json({
    status: "success",
    data: {
      books,
    },
  });
};

const getBookById = async (req, res, next) => {
  const id = req.params.id * 1;

  const [err, book] = await booksModel
    .findById(id)
    .populate({ path: "category", select: "omnia-category-name" })
    .populate({ path: "auhtor", select: "omnia-author-name" })
    .exec();
  if(err){
    return res.status(500).send(err.message)
  }
  res.status(200).json({
    status: "success",
    data: {
      book,
    },
  });
};


// find books for specific user
// add books for specific user
// edit books for specific user
// delete books for specifis user



module.exports = {
  addBook,
  editBook,
  deleteBook,
  getBooks,
  getBookById
};
