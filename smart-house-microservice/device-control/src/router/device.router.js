const express = require('express')
const Device = require('../model/Device.model')
const userAuth = require('../middleware/userAuth')
const commandMappings = require('../utils/commands')
const maintenanceThresholds = require('../utils/maintainanceThresholds')
const rateLimit = require('express-rate-limit');
const { Error } = require('mongoose')
const router = express.Router()
const axios = require('axios');

// Rate limiter middleware
const deviceRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 100 requests per `window` (15 minutes)
    message: {
        status: {
            code: 429,
            message: 'Too many requests, please try again later.',
        },
        data: {}
    },
});

router.post('/commands', deviceRateLimiter, userAuth, async (req, res) => {
    const { id, category, command, value } = req.body;

    if (!id || !category || !command || value === undefined) {
        return res.status(400).json({
            error: "All fields (id, category, command, value) are required."
        });
    }

    const categoryConfig = commandMappings.commandMappings[category];
    if (!categoryConfig) {
        return res.status(400).json({ error: `Invalid category: ${category}` });
    }

    const commandConfig = categoryConfig[command];
    if (!commandConfig) {
        return res.status(400).json({ error: `Unsupported command: ${command}` });
    }

    try {
        // Fetch the device to check its state
        const device = await Device.findById(id);
        if (!device) {
            return res.status(404).json({ error: "Device not found." });
        }

        // Ensure no commands other than "turn_on" are allowed if the device is off
        if (command !== 'turn_on' && !device.isOn) {
            return res.status(403).json({
                error: `Cannot execute command '${command}' because the device is currently turned off.`
            });
        }

        // Validate the command value
        validateCommandValue(command, value, commandConfig);

        // Handle "Turn On/Off" commands
        if (command === 'turn_on') {
            if (value === true) {
                await handleTurnOn(device);
            } else if (value === false) {
                await handleTurnOff(req,device);
            } else {
                throw new Error("Invalid value for 'turn_on'. Allowed: [true, false]");
            }
        } else {
            // Placeholder for executing other commands
            await executeCommand(device, command, value);
        }

        res.status(200).json({
            status: {
                code: 200,
                message: `Command '${command}' executed successfully with value: ${value}`
            },
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

/**
 * Utility to validate command values based on configuration.
 */
function validateCommandValue(command, value, commandConfig) {
    const { type, values } = commandConfig;

    if (type === 'boolean') {
        if (!values.includes(value)) {
            throw new Error(`Invalid value for ${command}. Allowed: ${values}`);
        }
    } else if (type === 'range') {
        if (value < values.min || value > values.max) {
            throw new Error(
                `Invalid value for ${command}. Must be between ${values.min} and ${values.max}.`
            );
        }
    } else if (Array.isArray(values) && !values.includes(value)) {
        throw new Error(`Invalid value for ${command}. Allowed: ${values}`);
    }
}

/**
 * Handle "Turn On" command by updating the device state.
 */
async function handleTurnOn(device) {
    if (device.isOn) {
        throw new Error(`Device is already turn-on.`);
    }
    device.isOn = true;
    device.lastTurnedOn = new Date();
    await device.save();
}

/**
 * Handle "Turn Off" command by calculating usage and updating the device state.
 */
async function handleTurnOff(req,device) {
    if (!device.isOn || !device.lastTurnedOn) {
        throw new Error(`Device is not currently on or missing turn-on time.`);
    }

    const endTime = new Date();
    const startTime = device.lastTurnedOn;
    const userId = device.userId;

    // Save the usage data

    const watts = device.watts;
    const deviceId = device._id;
    axios.post(`${process.env.ANALYTICS_URL}/app-events`, { task: 'ADD_USAGE', usage: { userId, deviceId, startTime, endTime , watts} }, {headers: {
        'Authorization': req.header('Authorization')
    }});

    // const newUsage = new Usage({
    //     userId,
    //     deviceId,
    //     startTime,
    //     endTime
    // });

    // Save usage data to database

    // Update the device's state
    device.isOn = false;
    await device.save();
}

/**
 * Placeholder for executing other commands.
 */
async function executeCommand(device, command, value) {
    console.log(`Executing '${command}' on device '${device.name}' with value '${value}'.`);
}


/**
 * Helper function to format a Date object into "YYYY-MM-DD HH:MM:SS"
 */
function formatDateTime(date) {
    const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
    };

    const formattedDate = new Date(date).toLocaleString('en-GB', options);
    return formattedDate.replace(',', ''); // Remove comma between date and time
}

/**
 * Helper function to calculate duration in minutes
 */


module.exports = router