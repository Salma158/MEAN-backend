/* eslint-disable linebreak-style */
const router = require('express').Router();
const { authorsController } = require('../controllers');

router.get('/', authorsController.getAllAuthors);

router.post('/', authorsController.createAuthor);

router.delete('/:id', authorsController.deleteAuthor);

router.patch('/:id', authorsController.updateAuthor);

router.get('/:id', authorsController.getAllAuthorsBooks);

module.exports = router;
