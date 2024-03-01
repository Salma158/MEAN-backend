const CustomError = require("../lib/customError");

const handleValidationError = (error, next) => {
    const validationErrors = Object.values(error.errors).map(
      (err) => err.message
    );
    return next(new CustomError(
      validationErrors.join(", "), 400));
};

module.exports = handleValidationError;



// in json shape ??