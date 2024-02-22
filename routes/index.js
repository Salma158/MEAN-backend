/* eslint-disable linebreak-style */
const router = require('express').Router();
const booksRouter = require("./routes/booksRouter");
const userRouter = require('./routes/users');
const auth = require('./middlewares/auth');
const userBooksRouter = require("./routes/userBooksRouter");
router.use('/categories', require('./categories'));
router.use('/authors', require('./authors'));
app.use("/books", booksRouter);
app.use("/user", userRouter);
app.use('/userbooks', auth.authorization, userBooksRouter);

module.exports = router;
