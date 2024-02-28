const User = require('../models/users');
const asyncWrapper = require('../lib/asyncWrapper');
const CustomError = require('../lib/customError');
const jsonWebToken = require('jsonwebtoken');
const addOne = async (req, res, next) => {
    const newUser = req.body;
   // const photoFullPath = `${req.protocol}://${req.get('host')}/profile/${req.file.filename}`;
    const [err, user] = await asyncWrapper(User.create({
        userName: newUser.userName,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
       // photo: photoFullPath
    }));
    if (err) {
        return next(new CustomError(err.message, 400));
    }
    res.status(201).json({ message: 'User created successfully', user });

}
const logIn = async (req, res, next) => {
    const { userName, password } = req.body;
    if (!userName || !password) {
        return next(new CustomError('Please provide valid username and password', 400));
    }
    const [err, user] = await asyncWrapper(User.findOne({ userName }).exec());
    if (err) {
        return next(new CustomError('unautharized', 401));
    }
    const valid = await user.verifyPassword(password);
    if (!valid) {
        return next(new CustomError('unautharized', 401));
    }
    // eslint-disable-next-line no-underscore-dangle
    const token = jsonWebToken.sign({ userName, id: user._id }, 'asdfghjkl1qwedfvgb', { expiresIn: '1d' });
    return res.json(token);
}
const findOne = async (req, res, next) => {
    const userId = req.userId;
    const [err, user] = await asyncWrapper(User.findById(id).exec());
    if (err) {
        return next(new CustomError('Not found', 404));
    }
    return res.json(user);
}
const getAll = async (req, res, next) => {

    const [err, user] = await asyncWrapper(User.find().exec());
    if (err) {
        return next(new CustomError('Not found', 404));
    }
    return res.json(user);
}
const updateRole = async (req, res, next) => {
    const { role } = req.body;
    const { id } = req.params;
    const [err, user] = await asyncWrapper(User.findByIdAndUpdate(id, { role: role }, { new: true }).exec());
    if (err) {
        return next(new CustomError('Not found', 404));
    }
    return res.json(user);
}

module.exports = {
    addOne,
    logIn,
    findOne,
    getAll,
    updateRole
};