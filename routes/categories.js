/* eslint-disable linebreak-style */
const router = require('express').Router();
const { categoriesController } = require('../controllers');
const auth = require('./middlewares/auth');
router.get('/', categoriesController.getAllCategories);

router.post('/', auth.authorization, auth.restrictTo('admin'), categoriesController.createCategory);

router.delete('/:id', auth.authorization, auth.restrictTo('admin'), categoriesController.deleteCategory);

router.get('/popular', categoriesController.getPopularCategories);

router.get('/:id', categoriesController.getCategoryBooks);

router.patch('/:id', auth.authorization, auth.restrictTo('admin'), categoriesController.updateCategory);

module.exports = router;
