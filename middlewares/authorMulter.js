const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'images/authors/');
  },
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  },
});

const authorMulter = multer({ storage: storage });

module.exports = authorMulter;
