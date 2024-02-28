const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, res, cb) => {
        cb(null, 'images/profile/')
    },
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname));
    }

});
const checkType = (file, cb) => {
    const types = /jpeg|jpg|png|gif/;
    const extension = types.test(path.extname(file.originalname).toLowerCase());
    const mimetype = types.test(file.mimetype);

    if (mimetype && extension) {
        return cb(null, true);
    } else {
        cb('Error: Images only!');
    }
}
const upload = multer({
    storage: storage,
    fileFilter: function (req, file, cb) {
        checkType(file, cb);
    }
});



module.exports = upload;