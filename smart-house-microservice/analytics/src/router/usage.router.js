const express = require('express');
const userAuth = require('../middleware/userAuth');
const Usage = require('../model/Usage.model');
const { suggestReductionMethods } = require('../utils/carbonFootPrint');
const maintenanceThresholds = require('../utils/maintainanceThresholds')
const axios = require('axios');
const router = express.Router();

// Constants
const CARBON_INTENSITY_FACTOR = 450; // grams of CO2 per kWh

// Helper function to validate date format and range
const isValidDate = (date) => {
    const [year, month, day] = date.split('-').map(Number);

    // Check if the year, month, or day is invalid
    if (isNaN(year) || isNaN(month) || isNaN(day) || month < 1 || month > 12 || day < 1) {
        return false;
    }

    // Create a date object from the provided year, month, and day
    const parsedDate = new Date(year, month - 1, day);

    // Check if the generated date's month is still the same as the provided month
    // The month in Date is 0-indexed (January = 0, December = 11)
    return parsedDate.getFullYear() === year &&
           parsedDate.getMonth() === month - 1 &&
           parsedDate.getDate() === day;
};


router.get('/report/:deviceId', userAuth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { startDate, endDate } = req.query;

        // Validate deviceId
        if (!deviceId || !deviceId.match(/^[a-fA-F0-9]{24}$/)) {
            return res.status(400).json({status:{ error: "Invalid or missing device ID", code: "400" },data:{}});
        }

        // Validate dates
        if (!startDate || !endDate) {
            return res.status(400).json({status:{ error: "Start date and end date are required", code: "400" },data:{}});
        }
        
        if (!isValidDate(startDate) || !isValidDate(endDate)) {
            return res.status(400).json({status:{ error: "Invalid date format", code: "400" },data:{}});
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return res.status(400).json({status:{ error: "Start date must be before end date", code: "400" },data:{}});
        }
        const userId = req.user._id;

        // Fetch usage logs for the device within the time range
        const usageLogs = await Usage.find({
            userId,
            deviceId,
            startTime: { $gte: start },
            endTime: { $lte: end }
        }).sort({ startTime: 1 });

        if (usageLogs.length === 0) {
            return res.status(200).json({status:{ message: "No usage data found for the given time range", code: "200" },data:{}});
        }

        // Initialize analytics variables
        let totalPowerConsumption = 0;
        let totalUsageTime = 0;
        let peakPowerUsage = 0;
        let firstUsageTime = usageLogs[0].startTime;
        let lastUsageTime = usageLogs[usageLogs.length - 1].endTime;
        const hourlyUsage = {};

        usageLogs.forEach((log) => {
            const { energyConsumed, startTime, endTime, duration } = log;
            totalPowerConsumption += energyConsumed;
            totalUsageTime += duration;

            if (energyConsumed > peakPowerUsage) {
                peakPowerUsage = energyConsumed;
            }

            const hour = new Date(startTime).getHours();
            hourlyUsage[hour] = (hourlyUsage[hour] || 0) + energyConsumed;
        });

        const avgPowerConsumption = totalPowerConsumption / totalUsageTime;

        const totalPowerConsumptionInKWh = totalPowerConsumption / 1000;
        const carbonConsumption = (totalPowerConsumptionInKWh * CARBON_INTENSITY_FACTOR) / 1000;

        const hourlyData = [];
        for (let i = 0; i < 24; i++) {
            hourlyData.push({
                hour: i,
                consumption: hourlyUsage[i] || 0
            });
        }

        const analytics = {
            deviceId,
            totalPowerConsumption,
            totalUsageTime,
            peakPowerUsage,
            avgPowerConsumption,
            firstUsageTime,
            lastUsageTime,
            hourlyData,
            carbonConsumption
        };

        res.status(200).json({ analytics, code: "200" });
    } catch (error) {
        console.error("Error fetching device analytics:", error);
        res.status(500).json({status:{ error: "Internal server error", code: "500" },data:{}});
    }
});


router.get('/env-footprint/:deviceId', userAuth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const { startDate, endDate } = req.query;

        if (!deviceId || !deviceId.match(/^[a-fA-F0-9]{24}$/)) {
            return res.status(400).json({status:{ error: "Invalid device ID", code: 400 },data:{}});
        }

        if (!startDate || !endDate || !isValidDate(startDate) || !isValidDate(endDate)) {
            return res.status(400).json({status:{ error: "Invalid or missing date range", code: 400 },data:{}});
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        if (start > end) {
            return res.status(400).json({status:{ error: "Start date must be before end date", code: 400 },data:{}});
        }

        const usageLogs = await Usage.find({
            deviceId,
            startTime: { $gte: start },
            endTime: { $lte: end }
        }).sort({ startTime: 1 });


        if (usageLogs.length === 0) {
            return res.status(200).json({status:{ message: "No usage data found", code: 200 },data:{}});
        }

        const totalPowerConsumption = usageLogs.reduce((total, log) => total + log.energyConsumed, 0);
        const totalPowerConsumptionInKWh = totalPowerConsumption / 1000;
        const carbonConsumption = (totalPowerConsumptionInKWh * CARBON_INTENSITY_FACTOR) / 1000;

        const reductionSuggestions = suggestReductionMethods(carbonConsumption);

        res.status(200).json({status:{ message:"Environmental Footprint Fetched", code: 200 },data:{carbonConsumption, reductionSuggestions}});
    } catch (error) {
        console.error("Error calculating environmental footprint:", error);
        res.status(500).json({status:{ error: "Internal server error", code: 500 },data:{}});
    }
});

router.post('/app-events', userAuth, async (req, res) => {

    const task = req.body.task;
    if (task.includes('ADD_USAGE')) {
        const {userId,deviceId,startTime,endTime,watts} = req.body.usage;
        const durationHours = (new Date(endTime) - new Date(startTime)) / (1000 * 60 * 60);
        const duration = durationHours;
    
        // Assuming device's power consumption in watts is stored in the Device schema

        console.log(res);
        // watts = res.data.data.watts;

           const energyConsumed = watts * durationHours; // Energy in watt-hours
        console.log(userId,deviceId,startTime,endTime)
         const newUsage = new Usage({
        userId,
        deviceId,
        startTime,
        endTime,
        duration,
        energyConsumed
    });
    await newUsage.save();
        return res.status(200).send({
            status: 200,
            data: {
                message: "Usage Saved Successfully"
            }
        })
    }
    else if(task.includes('FIND_USAGE_BY_ID')){
        const deviceId = req.body.deviceId;
        const userId = req.body.userId;
        console.log(userId,deviceId)
        const usageLogs = await Usage.find({ userId:userId ,deviceId:deviceId});
        if(usageLogs){
            return res.status(200).send({
                status: 200,
                data: {
                    usageLogs: usageLogs
                }
            });
        }
    }

});

router.get('/maintenance/:deviceId', userAuth, async (req, res) => {
    try {
        const { deviceId } = req.params;

        if (!deviceId) {
            return res.status(400).json({ error: "Device ID is required" });
        }

        const result = await axios.get(`${process.env.DEVICE_REGISTER_URL}/${deviceId}`,{headers: {
            'Authorization': req.header('Authorization')
        }});
        const device = result.data.data.device;
        // Retrieve the device details
        if (!device) {
            return res.status(404).json({ error: "Device not found" });
        }


        // Retrieve the maintenance thresholds for the device category
        const threshold = maintenanceThresholds.maintenanceThresholds[device.category];
        console.log(threshold)

        if (!threshold) {
            return res.status(400).json({ error: `No maintenance thresholds defined for category: ${device.category}` });
        }

        // Fetch usage logs for the device
        const usageLogs = await Usage.find({ deviceId });
        console.log(res);
        let totalHours = 0;
        let totalEnergy = 0;

        usageLogs.forEach(log => {
            totalHours += log.duration;
            totalEnergy += log.energyConsumed;
        });

        // Maintenance determination
        let maintenanceNeeded = false;
        const maintenanceReasons = [];
        const maintenanceRecommendations = [];

        if (totalHours >= threshold.hours) {
            maintenanceNeeded = true;
            maintenanceReasons.push(`Exceeded recommended operational hours: ${totalHours} hrs`);
            maintenanceRecommendations.push("Check and service components frequently used during operation.");
        }

        if (totalEnergy >= threshold.energy) {
            maintenanceNeeded = true;
            maintenanceReasons.push(`Exceeded recommended energy consumption: ${totalEnergy} watt-hours`);
            maintenanceRecommendations.push("Inspect power supply and energy-intensive components.");
        }

        if (!maintenanceNeeded) {
            maintenanceRecommendations.push("No immediate maintenance required. Continue regular checks.");
        }

        // Response object
        const response = {
            device: device.name,
            category: device.category,
            maintenanceNeeded,
            reasons: maintenanceReasons,
            recommendations: maintenanceRecommendations,
            nextMaintenanceIn: maintenanceNeeded
                ? "Immediate maintenance required"
                : `${threshold.hours - totalHours} hours or ${threshold.energy - totalEnergy} watt-hours`
        };

        res.status(200).json(response);
    } catch (error) {
        console.error("Error suggesting maintenance:", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.get('/usage/:deviceId', userAuth, async (req, res) => {
    try {
        const { startTime, endTime } = req.query;
        const deviceId = req.params.deviceId;

        // Build the query object
        const query = {};

        // Validate and parse query parameters
        if (startTime) {
            const parsedStartTime = new Date(startTime);
            if (isNaN(parsedStartTime)) {
                return res.status(400).json({ error: 'Invalid startTime format' });
            }
            query.startTime = { $gte: parsedStartTime };
        }

        if (endTime) {
            const parsedEndTime = new Date(endTime);
            if (isNaN(parsedEndTime)) {
                return res.status(400).json({ error: 'Invalid endTime format' });
            }
            query.endTime = { ...(query.endTime || {}), $lte: parsedEndTime };
        }

        if (deviceId) {
            query.deviceId = deviceId;
        }

        // Ensure the logged-in user is only accessing their usage data
        query.userId = req.user._id;

        // Fetch usage data with filters and populate device details
        const usageData = await Usage.find(query);

        if (!usageData.length) {
            return res.status(404).json({ message: 'No usage data found for the specified criteria.' });
        }

        // Format date fields and calculate duration in the response
        const formattedUsageData = usageData.map((usage) => {
            const startTimeFormatted = usage.startTime ? usage.startTime.toISOString() : null;
            const endTimeFormatted = usage.endTime ? usage.endTime.toISOString() : null;

            // Calculate duration in minutes
            const duration = usage.endTime
                ? Math.round((usage.endTime - usage.startTime) / 60000) // Convert ms to minutes
                : null;

            return {
                ...usage.toObject(),
                startTime: startTimeFormatted,
                endTime: endTimeFormatted,
                duration // Duration in minutes
            };
        });

        res.status(200).json({ usage: formattedUsageData });
    } catch (error) {
        const message =
            error.name === 'CastError'
                ? 'Invalid Device ID'
                : 'Internal Server Error';
        console.error("Error retrieving device usage:", error);
        res.status(500).json({ error: message });
    }
});

module.exports = router;