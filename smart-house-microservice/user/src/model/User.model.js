const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const validator=require('validator');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
    },
    username: {
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    contactNumber: {
        type: Number,
        min: [6000000000, " error: invalid mobile number"],
        max: [9999999999, " error: invalid mobile number"],
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('error: invalid email')
            }
        }
    },
    address: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    tokens: [{
        token: {
            type: String
        }
    }]
});

userSchema.methods.generateAuthToken = async function () {
    const user = this;
    console.log(process.env.JWT_SECRET);
    const startDate = Date.now(); // Current timestamp
    const token = jwt.sign(
        { 
            _id: user._id.toString(), 
            startDate 
        }, 
        process.env.JWT_SECRET
    );
    user.tokens = user.tokens.concat({ token });
    console.log(token);
    await user.save();
    return token;
};

userSchema.methods.toJSON=function() {
    const user=this
    const userObject=user.toObject()
    delete userObject._id
    delete userObject.__v
    delete userObject.password
    delete userObject.tokens
    return userObject
}

userSchema.statics.findByCredentials=async (username, password)=>{
    const user=await User.findOne({username})
    if (!user) {
        throw new Error('UserNotExist')
    }
    const isMatch=await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('PasswordNotMatch')
    }
    return user
}

userSchema.pre('save', async function (next) {
    const user=this
    if (user.isModified('password')) {
        const fname=user.name.split(" ")[0]
        user.password=await bcrypt.hash(user.password, fname.length>8?fname.length:8)
    }
    next();
});


const User=mongoose.model('user', userSchema);

module.exports=User
