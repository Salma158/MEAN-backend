const express = require("express")
const booksRouter = express.Router()
const booksController = require('../controllers/booksController')


booksRouter.route('/')
    .post(booksController.addBook)
    .get(booksController.getBooks)
    

booksRouter.route("/:id")
    .patch(booksController.editBook)
    .delete(booksController.deleteBook)



module.exports = booksRouter