/* eslint-disable linebreak-style */
const router = require('express').Router();
const booksRouter = require("./booksRouter");
const userRouter = require('./users');
const auth = require('../middlewares/auth');
const userBooksRouter = require("./userBooksRouter");
router.use('/categories', require('./categories'));
router.use('/authors', require('./authors'));
router.use("/books", booksRouter);
router.use("/user", userRouter);
router.use('/userbooks', 
//auth.authorization,
userBooksRouter);

module.exports = router;
