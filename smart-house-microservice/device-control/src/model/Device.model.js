const mongoose = require('mongoose');

const deviceSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    device_identifier:{
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    build_number:{
        type: String,
        trim: true,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true,
        trim: true,
    },
    watts: {
        type: Number,
        trim: true,
    },
    model: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    isOn: { // New field to track the device's state
        type: Boolean,
        default: false,
    },
    lastTurnedOn: { // New field to track the timestamp when the device was last turned on
        type: Date,
        default: null,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

module.exports = mongoose.model('Device2', deviceSchema);
