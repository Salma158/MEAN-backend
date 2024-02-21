const router = require('express').Router();
const userController = require('../controllers/users');
const auth = require('../middlewares/auth');

router.post('/', userController.signUp);
router.post('/login', userController.logIn);
router.get('/', auth.authorization, auth.restrictTo('admin'), userController.getAll);
router.patch('/:id', auth.authorization, auth.restrictTo('admin'), userController.updateRole)

module.exports = router;
