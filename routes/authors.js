/* eslint-disable linebreak-style */
const router = require('express').Router();
const { authorsController } = require('../controllers');
const auth = require('../middlewares/auth')
const uploadImg = require('../middlewares/uploadImg')

router.get('/', authorsController.getAllAuthors);

router.post('/', auth.authorization, auth.restrictTo('admin'), uploadImg.authorpload.single('photo'), authorsController.createAuthor);

router.delete('/:id', auth.authorization, auth.restrictTo('admin'), authorsController.deleteAuthor);

router.patch('/:id', auth.authorization, auth.restrictTo('admin'), authorsController.updateAuthor);

router.get('/popular', authorsController.getPopularAuthors);

module.exports = router;
