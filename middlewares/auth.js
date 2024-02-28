const jsonWebToken = require('jsonwebtoken');
const User = require('../models/users')
const CustomError = require('../lib/customError');
const userController = require('../controllers/users');
const asyncWrapper = require('../lib/asyncWrapper');
function authorization(req, res, next) {
  const { authorization } = req.headers;

  if (!authorization) {
    return next(new CustomError('unautharized', 401));
  }
  const valid = jsonWebToken.verify(authorization, process.env.JWTKEY);

  if (!valid) {
    return next(new CustomError('unautharized', 401));
  }
  req.userId = valid.id;
  return next();
}
restrictTo = (role) => {
  return async (req, res, next) => {
    const [err, user] = await asyncWrapper(User.findById(req.userId));
    if (err) {
      return next(new CustomError('Not found', 404));
    }

    if (user.role !== role) {
      return next(new CustomError('you are not admin', 401));
    }

    next();
  };
};

module.exports = {
  authorization,
  restrictTo
};

