const User = require('../models/users');
const asyncWrapper = require('../lib/asyncWrapper');
const CustomError = require('../lib/customError');
const jsonWebToken = require('jsonwebtoken');
const fs = require('fs')
const addOne = async (req, res, next) => {
    const newUser = req.body;
    if (!req.file || !req.file.filename) {
        return next(new CustomError('you must add photo', 400));
    }
    const [err, user] = await asyncWrapper(User.create({
        userName: newUser.userName,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        email: newUser.email,
        password: newUser.password,
        photo: req.file.filename,
        role: newUser.role
    }));
    if (err) {
        fs.unlinkSync(req.file.path);
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
    if (!user) {
        return next(new CustomError('Invalid user Name', 401));
    }
    const valid = await user.verifyPassword(password);
    if (!valid) {
        return next(new CustomError('incorrect password', 401));
    }
    const token = jsonWebToken.sign({ userName, id: user._id, role: user.role }, process.env.JWTKEY, { expiresIn: '1d' });

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
logOut = (req, res) => {
    req.session = null;
    return res.status(200).send({ message: "You've been signed out!" });

}

module.exports = {
    addOne,
    logIn,
    findOne,
    getAll,
    updateRole,
    logOut
};