/* eslint-disable linebreak-style */
const router = require('express').Router();
const { categoriesController } = require('../controllers');

router.get('/', categoriesController.getAllCategories);

router.post('/', categoriesController.createCategory);

router.delete('/:id', categoriesController.deleteCategory);

router.get('/popular', categoriesController.getPopularCategories);

router.get('/:id', categoriesController.getCategoryBooks);

router.patch('/:id', categoriesController.updateCategory);

module.exports = router;
