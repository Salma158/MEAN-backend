const router = require('express').Router();
const userController = require('../controllers/users');
const auth = require('../middlewares/auth');
const multerMiddleWare = require('../middlewares/uploadImg');
const authorsController = require('../controllers/authors');


router.post('/', multerMiddleWare.profileUpload.single("photo"), userController.addOne);
router.post('/login', userController.logIn);
router.get('/', auth.authorization, auth.restrictTo('admin'), userController.getAll);
router.patch('/:id', auth.authorization, auth.restrictTo('admin'), userController.updateRole)
router.get('/authors/:id', auth.authorization, auth.restrictTo('admin'), authorsController.getAuthorDetails);

module.exports = router;
