const express = require("express")
const booksRouter = express.Router()
const booksController = require('../controllers/booksController')
const upload = require('../middlewares/multerConfig')

booksRouter.route('/')
    .post(upload.single("image"), booksController.addBook)
    .get(booksController.getBooks)

booksRouter.route('/popularBooks')
    .get(booksController.getPopularBooks)

booksRouter.route('/searchBook')
    .get(booksController.searchBook)
    

booksRouter.route("/:id")
    .get(booksController.getBookById)
    .patch(booksController.editBook)
    .delete(booksController.deleteBook)



module.exports = booksRouter