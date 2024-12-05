const mongoose = require('mongoose');
const axios = require('axios')

const usageSchema = new mongoose.Schema({

    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    deviceId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Device',
        required: true
    },
    startTime: {
        type: Date,
        required: true
    },
    endTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number, // Duration in minutes or seconds, calculated in middleware
        // required: true
    },
    energyConsumed: {
        type: Number, // Calculated energy usage in watt-hours (or kWh)
        // required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Middleware to calculate duration and energyConsumed before saving
// usageSchema.pre('save', function (next) {
//     const usage = this;

//     console.log("in Pre save");

//     // Calculate duration in hours
//     const durationHours = (new Date(usage.endTime) - new Date(usage.startTime)) / (1000 * 60 * 60);
//     usage.duration = durationHours;

//     // Assuming device's power consumption in watts is stored in the Device schema

//     const watts = null;
//     axios.post('http://localhost:8080/api/v1/device/app-events', { task: 'DEVICE_WATTAGE', id: usage.deviceId }, { headers: {
//         'Authorization':req.header('Authorization')
//     } });
//     if (watts) {
//         usage.energyConsumed = watts * durationHours; // Energy in watt-hours
//     }
//     next();
// });

module.exports = mongoose.model('Usage', usageSchema);
