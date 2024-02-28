const express = require("express")
const booksRouter = express.Router()
const booksController = require('../controllers/booksController')
const upload = require('../middlewares/multerConfig')
const auth = require('../middlewares/auth')
booksRouter.route('/')
    .post(auth.authorization, auth.restrictTo('admin'), upload.single("image"), booksController.addBook)
    .get(booksController.getBooks)

booksRouter.route('/popularBooks')
    .get(booksController.getPopularBooks)

booksRouter.route('/searchBook')
    .get(booksController.searchBook)


booksRouter.route("/:id")
    .get(booksController.getBookById)
    .patch(auth.authorization, auth.restrictTo('admin'), booksController.editBook)
    .delete(auth.authorization, auth.restrictTo('admin'), booksController.deleteBook)



module.exports = booksRouter