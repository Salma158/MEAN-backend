const jsonWebToken = require('jsonwebtoken');
const User = require('../models/users')
const CustomError = require('../lib/customError');
const userController = require('../controllers/users');
authorization = (req, res, next) => {

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
    const userRole = req.headers.role;
    if (!userRole || userRole !== role) {
      return next(new CustomError('you are not admin', 401));
    }

    next();
  };
};

module.exports = {
  authorization,
  restrictTo
};

