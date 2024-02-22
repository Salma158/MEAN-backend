const path = require("path");
const parentDir = path.resolve(__dirname, "..");
const userbooksModelPath = path.join(parentDir, "models", "UserBooksModel");
const UserBook = require(userbooksModelPath);
const asyncWrapper = require("./../lib/asyncWrapper");
const CustomError = require("./../lib/customError");

// ---------get user books by user id according to the status------------
const getUserBooksByStatus = async (req, res, next) => {
  const { userId, status } = req.query;
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 20;
  const skip = (page - 1) * limit;

  if (req.query.page) {
    const userBooksCount = await UserBook.countDocuments({
      user: userId,
      status,
    });
    if (skip >= userBooksCount)
      return next(new CustomError("No more user books to view!", 404));
  }

  const [err, userBooks] = await asyncWrapper(
    UserBook.find({ user: userId, status })
      .populate("Book")
      .skip(skip)
      .limit(limit)
  );

  if (err) {
    return next(new CustomError("Error getting user books!", 500));
  }

  res.status(200).json({
    status: "success",
    data: {
      userBooks,
    },
  });
};

//--------- update user book review or rating or status ------------
const editUserBook = async (req, res, next) => {
  const { id } = req.params;
  const { review, rating, status } = req.body;

  const updates = {};
  if (review) updates.review = review;
  if (rating) updates.rating = rating;
  if (status) updates.status = status;

  updates.updated_at = new Date();

  const [err, updatedUserBook] = await asyncWrapper(
    UserBook.findByIdAndUpdate(id, updates, { new: true })
  );

  if (err) {
    return next(new CustomError("Error updating user book!", 500));
  }

  res.status(200).json({
    status: "success",
    data: {
      updatedUserBook,
    },
  });
};

// ------------ add new book to the users books ----------------
const addUserBook = async (req, res, next) => {
  const { userId, bookId, status } = req.body;

  const newUserBook = new UserBook({
    user: userId,
    book: bookId,
    status: status,
  });

  const [err, addedUserBook] = await asyncWrapper(newUserBook.save());
  if (err) {
    return next(new CustomError("Error adding user book!", 500));
  }

  res.status(201).json({
    status: "success",
    data: {
      addedUserBook,
    },
  });
};

//------------ delete user book by user id ----------------
const deleteUserBook = async (req, res, next) => {
  const { id } = req.params;

  const [err, deletedUserBook] = await asyncWrapper(
    UserBook.findByIdAndDelete(id)
  );

  if (err) {
    return next(new CustomError("Error deleting user book!", 500));
  }

  res.status(200).json({
    status: "success",
    message: "User book deleted successfully",
  });
};

module.exports = {
  getUserBooksByStatus,
  editUserBook,
  addUserBook,
  deleteUserBook,
};
