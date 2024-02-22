const express = require("express")
const userBooksRouter = express.Router()
const userBooksController = require('../controllers/userBooksController')


userBooksRouter.route('/')
    .post(userBooksController.addUserBook)
    .get(userBooksController.getUserBooksByStatus)
    

userBooksRouter.route("/:id")
    .patch(userBooksController.editUserBook)
    .delete(userBooksController.deleteUserBook)



module.exports = userBooksRouter