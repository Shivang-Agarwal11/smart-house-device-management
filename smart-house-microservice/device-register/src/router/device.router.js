const express = require('express')
const Device = require('../model/Device.model')
const userAuth = require('../middleware/userAuth')
const commandMappings = require('../utils/commands')
const maintenanceThresholds = require('../utils/maintainanceThresholds')
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose')
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

router.get('/:deviceId', deviceRateLimiter, userAuth, async (req, res) => {
    const id = req.params.deviceId;
    if (id !== undefined) {
        // Fetch device by ID
        try {
            const device = await Device.findOne({ _id: id, userId: req.user._id });
            if (!device) {
                return res.status(404).send({
                    status: {
                        code: 404,
                        message: 'Device not found',
                    },
                    data: {},
                });
            }
            return res.status(200).send({
                status: {
                    code: 200,
                    message: 'Device Found',
                },
                data: {
                    device,
                },
            });
        } catch (error) {
            const message =
                error.name === 'CastError'
                    ? 'Invalid Device ID'
                    : 'Internal Server Error';
            return res.status(400).send({
                status: {
                    code: 500,
                    message,
                },
                data: {},
            });
        }
    }
});



router.get('/', deviceRateLimiter, userAuth, async (req, res) => {
    const { page = 1, limit = 10, sortField = 'createdAt', sortOrder = 'desc', ...filters } = req.query;

    // Validate pagination parameters
    if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
        return res.status(400).send({
            status: {
                code: 400,
                message: "Invalid pagination parameters",
            },
            data: {},
        });
    }

    // Construct filter object based on query parameters (excluding pagination, sorting)
    let filterConditions = {};
    if (filters) {
        for (const [key, value] of Object.entries(filters)) {
            if (value) {
                filterConditions[key] = value; // add filter condition
            }
        }
    }

    // Define sort order
    const sort = {};
    sort[sortField] = sortOrder === 'asc' ? 1 : -1; // Default to descending if 'desc'
    filterConditions.userId = req.user._id;
    // Fetch filtered and paginated devices
    try {
        const devices = await Device.find(filterConditions)
            .skip((page - 1) * limit)
            .limit(Number(limit))
            .sort(sort);

        const totalDevices = await Device.countDocuments(filterConditions); // Get total count of filtered devices

        return res.status(200).send({
            status: {
                code: 200,
                message: 'Devices list returned successfully',
            },
            data: {
                devices,
                pagination: {
                    currentPage: Number(page),
                    totalPages: Math.ceil(totalDevices / limit),
                    totalItems: totalDevices,
                },
            },
        });
    } catch (error) {
        return res.status(500).send({
            status: {
                code: 500,
                message: 'Internal Server Error',
            },
            data: {},
        });
    }
});





router.post('/', userAuth, deviceRateLimiter, async (req, res) => {
    try {
        const devices = req.body;
        console.log(devices)

        // Validate request body
        if (!Array.isArray(devices) || devices.length === 0) {
            return res.status(400).send({
                status: {
                    code: 400,
                    message: "Invalid input. Provide an array of device details.",
                },
                data: null,
            });
        }

        if (devices.length > 5) {
            return res.status(400).send({
                status: {
                    code: 400,
                    message: "Device limit exceeded. Allowed only 5 registrations at a time.",
                },
                data: null,
            });
        }

        const requiredFields = ['device_identifier', 'build_number', 'name', 'location', 'category'];
        const allowedCategories = ['lighting', 'kitchen', 'climate', 'entertainment'];

        // Separate valid and invalid devices
        const validDevices = [];
        const invalidDevices = [];

        devices.forEach((device) => {
            if (
                requiredFields.every(field => device[field]) &&
                allowedCategories.includes(device.category)
            ) {
                validDevices.push(device);
            } else {
                invalidDevices.push({
                    device_identifier: device.device_identifier,
                    name: device.name,
                    error: !allowedCategories.includes(device.category)
                        ? `Invalid category. Allowed categories: ${allowedCategories.join(', ')}`
                        : "Missing required fields",
                });
            }
        });
        const userId = req.user._id;
        const savedDevices = [];
        const failedDevices = [...invalidDevices]; // Start with invalid devic

        // Process valid devices individually
        for (const deviceData of validDevices) {
            try {
                const savedDevice = await Device.create({
                    ...deviceData,
                    userId,
                });
                savedDevices.push(savedDevice);
            } catch (error) {
                if (error.code === 11000) {
                    failedDevices.push({
                        device_identifier: deviceData.device_identifier,
                        name: deviceData.name,
                        error: "Duplicate device_identifier or build_number",
                    });
                } else {
                    failedDevices.push({
                        device_identifier: deviceData.device_identifier,
                        name: deviceData.name,
                        error: error.message,
                    });
                }
            }
        }

        const registeredDevices = savedDevices.map(device => ({
            id: device._id,
            device_identifier: device.device_identifier,
            name: device.name,
        }));
        if (failedDevices.length === 0) {
            return res.status(200).send({
                status: {
                    code: 200,
                    message: "All Devices Registered.",
                },
                data: {
                    registeredDevices
                },
            });
        }
        else if (registeredDevices.length === 0) {
            return res.status(400).send({
                status: {
                    code: 400,
                    message: "Bad Request. Invalid Category or required fields are empty",
                },
                data: {
                    failedDevices
                },
            });
        }
        return res.status(207).send({
            status: {
                code: 207,
                message: "Devices processed.",
            },
            data: {
                registeredDevices,
                failedDevices,
            },
        });
    } catch (error) {
        console.error("Error processing devices:", {
            error: error.message,
            devices: req.body,
        });

        return res.status(500).send({
            status: {
                code: 500,
                message: "Internal Server Error",
            },
            data: {
                error: error.message,
            },
        });
    }
});



router.put('/:deviceId', deviceRateLimiter, userAuth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        const updates = req.body;
        const allowedUpdates = ["name", "watts", "model", "location", "category", "isOn"];
        const requestedFields = Object.keys(updates);

        // Validate requested updates
        const isValidUpdate = requestedFields.every((field) => allowedUpdates.includes(field));
        if (!isValidUpdate) {
            return res.status(400).send({
                status: {
                    code: 400,
                    message: "Invalid update fields provided",
                },
                data: {
                    invalidFields: requestedFields.filter((field) => !allowedUpdates.includes(field)),
                },
            });
        }

        console.log(req.user)
        // Find device and validate ownership
        const device = await Device.findOne({ _id: deviceId, userId: req.user._id });
        if (!device) {
            return res.status(404).send({
                status: {
                    code: 404,
                    message: "Device not found or unauthorized",
                },
                data: null,
            });
        }

        // Apply updates
        requestedFields.forEach((field) => {
            device[field] = updates[field];
        });

        // Save updated device
        await device.save();

        return res.status(200).send({
            status: {
                code: 200,
                message: "Device record updated successfully",
            },
            data: {
                device,
            },
        });
    } catch (error) {
        console.error("Error updating device:", error);

        // Differentiate between validation errors and unexpected errors
        if (error.name === "ValidationError") {
            return res.status(400).send({
                status: {
                    code: 400,
                    message: "Invalid data provided",
                },
                data: {
                    error: error.message,
                },
            });
        }

        return res.status(500).send({
            status: {
                code: 500,
                message: "Internal server error occurred",
            },
            data: null,
        });
    }
});


router.delete('/:deviceId', deviceRateLimiter, userAuth, async (req, res) => {
    try {
        const { deviceId } = req.params;
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(deviceId)) {
            return res.status(400).send({
                status: {
                    code: 400,
                    message: 'Invalid device ID'
                },
                data: {}
            });
        }

        // Ensure the device belongs to the authenticated user
        const device = await Device.findOneAndDelete({ _id: deviceId, userId: req.user._id });
        if (!device) {
            return res.status(404).send({
                status: {
                    code: 404,
                    message: 'Device not found or unauthorized'
                },
                data: {}
            });
        }

        res.status(200).send({
            status: {
                code: 200,
                message: 'Device deleted successfully'
            },
            data: {}
        });
    } catch (error) {
        console.error('Error deleting device:', error.message);
        res.status(500).send({
            status: {
                code: 500,
                message: 'Internal server error occurred'
            },
            data: {}
        });
    }
});

router.post('/app-events', userAuth, async (req, res) => {

    const task = req.body.task;
    if (task.includes('DELETE_USER')) {
        console.log("INSIDE DELETE _EVENTS")
        Device.deleteMany({ userId: req.user._id })
        return res.status(200).send({
            status: 200,
            data: {
                message:"DEVICES"
            }
        })
    }

});

module.exports = router