/* eslint-disable linebreak-style */
const router = require('express').Router();

router.use('/categories', require('./categories'));
router.use('/authors', require('./authors'));

module.exports = router;
