const multer = require('multer');
const path = require('path');
const CustomError = require('../lib/customError');

function configureStorage(destinationPath) {
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, destinationPath);
        },
        filename: function (req, file, cb) {
            cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
        }
    });
    return storage;
}
const checkType = (file, cb) => {
    const types = /jpeg|jpg|png|gif/;
    const extension = types.test(path.extname(file.originalname).toLowerCase());
    const mimetype = types.test(file.mimetype);

    if (mimetype && extension) {
        return cb(null, true);
    } else {
        cb(new CustomError('Error: Images only!'));
    }
}

const profileStorage = configureStorage('images/profile/');
const bookStorage = configureStorage('images/books/');
const authorStorage = configureStorage('images/authors/');

const profileUpload = multer({
    storage: profileStorage,
    fileFilter: function (req, file, cb) {
        checkType(file, cb);
    }
});
const bookUpload = multer({
    storage: bookStorage,
    fileFilter: function (req, file, cb) {
        checkType(file, cb);
    }
});
const authorpload = multer({
    storage: authorStorage,
    fileFilter: function (req, file, cb) {
        checkType(file, cb);
    }
});
module.exports = {
    profileUpload,
    bookUpload,
    authorpload
}