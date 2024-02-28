const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const usersSchema = new mongoose.Schema({
    userName: {
        type: String,
        required: true,
        unique: true,
        minlength: 8,
    },
    firstName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 15,
    },
    lastName: {
        type: String,
        required: true,
        minlength: 3,
        maxlength: 15,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        minlength: 8,
        required: true,
        validate: {
            validator: function (value) {
                return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(value);
            },
            message: props => `${props.value} is not a valid password. Password must contain at least one uppercase letter, one lowercase letter, one number, one special character, and be at least 8 characters long.`
        }

    },
    role: {
        type: String,
        enum: ['admin', 'user'],
        default: 'user'
    },
    photo: {
        type: String
    }
}, {
    timestamps: true,
},
    {
        toJSON: {
            transform: (doc, ret) => {
                ret.password = undefined;
                return ret;
            },
        },
    },);
usersSchema.pre('save', async function preSave() {
    this.password = await bcrypt.hash(this.password, 10);
});

usersSchema.methods.verifyPassword = async function verifyPassword(password) {
    const valid = await bcrypt.compare(password, this.password);
    return valid;
};

const Users = mongoose.model('Users', usersSchema);

module.exports = Users;
