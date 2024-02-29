const validateString = (data) => {
    if (!data || data.trim() === '') {
      return false;
    }
    return true;
  };

  module.exports = validateString;