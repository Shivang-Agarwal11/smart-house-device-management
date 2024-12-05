const express = require('express')
const userAuth = require('../middleware/userAuth')
const User = require('../model/User.model');
const { body, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const sanitize = require('mongo-sanitize');
const axios = require('axios')


const router = express.Router()

const loginLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 5 minutes
    max: 10, // 5 attempts
    message: {
        status: {
            code: 429,
            message: 'Too many login attempts. Please try again later in 15 minutes.'
        },
        data: {}
    }
});

const validateUserInput = [
    body('email').isEmail().normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9]).{8,}$/),
    body('contactNumber').isInt({ min: 6000000000, max: 9999999999 }),
    body('username').isLength({ min: 3 }).trim().escape(),
    body('name').trim().escape(),
    body('address').trim().escape()
];


router.post('/', loginLimiter, async (req, res) => {
    const sanitizedData = sanitize(req.body)
    const user = new User(sanitizedData);
    try {
        await user.save();
        console.log(user);
        const token = await user.generateAuthToken();
        return res.status(201).send({
            status: {
                code: 201,
                message: 'User created successfully'
            },
            data: {
                user,
                token,

            }
        })
    } catch (error) {
        console.log(error);
        if (error['errorResponse'] != undefined) {
            if (error['errorResponse']['keyPattern'] != undefined) {
                if (JSON.stringify(error['errorResponse']['keyPattern']).includes('username')) {
                    error = "Username should be unique";
                }
                else if (JSON.stringify(error['errorResponse']['keyPattern']).includes('contact')) {
                    error = "Contact Number already registered";
                }
                else if (JSON.stringify(error['errorResponse']['keyPattern']).includes('mail')) {
                    error = "Email already registered";
                }
            }
        }
        else if (error['errors'] != undefined && error['name'] !== undefined && error['name'].includes('Validation') !== undefined) {
            error = error['message']
        }
        return res.status(400).send({
            status: {
                code: 400,
                message: 'Bad Request, probably format of input doesn\'t matches with prescribed format',
            },
            data: {
                error: error
            }
        })
    }
});


router.post('/login', loginLimiter, async (req, res) => {
    try {
        const username = req.body.username;
        const password = req.body.password;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }
        const user = await User.findByCredentials(username, password)
        const token = await user.generateAuthToken()
        res.status(200).send({
            status: {
                code: 200,
                message: 'User logged-in successfully'
            },
            data: {
                user,
                token
            }
        })
    } catch (error) {
        if (error.message === 'UserNotExist') {
            return res.status(404).send({
                status: {
                    code: 404,
                    message: 'Either username is incorrect or user not registered'
                },
                data: {}
            })
        } else if (error.message === 'PasswordNotMatch') {
            return res.status(403).send({
                status: {
                    code: 403,
                    message: 'Password didn\'t matched'
                },
                data: {}
            })
        }
        res.status(400).send({
            status: {
                code: 400,
                message: 'Bad request'
            },
            data: {}
        })
    }
})



router.post('/logout', loginLimiter, userAuth, async (req, res) => {
    const user = req.user
    try {
        user.tokens = []
        await user.save()
        res.status(200).send({
            status: {
                code: 204,
                message: 'User logged-out from all systems'
            },
            data: {}
        })
    } catch (error) {
        res.status(500).send({
            status: {
                code: 500,
                message: 'Internal server error occured'
            },
            data: {}
        })
    }
});

router.put('/', userAuth, loginLimiter, async (req, res) => {
    const allowedUpdates = ['name', 'email', 'password', 'contactNumber', 'address']; // Define allowed fields
    const updates = Object.keys(req.body);
    const isValidUpdate = updates.every(update => allowedUpdates.includes(update)); // Validate fields
    const user = req.user;

    if (!isValidUpdate) {
        return res.status(400).send({
            status: {
                code: 400,
                message: 'Invalid fields for update'
            },
            data: {}
        });
    }

    try {
        // Apply updates to the user object
        updates.forEach(update => user[update] = req.body[update]);

        await user.save(); // Save the updated user document

        res.status(200).send({
            status: {
                code: 200,
                message: 'User record updated successfully'
            },
            data: {
                user
            }
        });
    } catch (error) {
        // Handle specific errors, e.g., database validation or others
        if (error.name === 'ValidationError') {
            return res.status(400).send({
                status: {
                    code: 400,
                    message: 'Validation error occurred',
                },
                data: {
                    error: error.message
                }
            });
        }

        res.status(500).send({
            status: {
                code: 500,
                message: 'Internal server error occurred'
            },
            data: {}
        });
    }
});



router.delete('/', loginLimiter, userAuth, async (req, res) => {
    const user = req.user
    try {
        // Delete related records
        console.log(process.env.DEVICE_REGISTER_URL)
         await axios.post(`${process.env.DEVICE_REGISTER_URL}/app-events`, {task : "DELETE_USER"}, {
            headers: {
                'Authorization': req.header('Authorization')
            }
        });
        // Delete the user
        const result = await User.deleteOne({ _id: user._id });

        if (result.deletedCount === 0) {
            return res.status(404).send({
                status: {
                    code: 404,
                    message: 'User not found'
                },
                data: {}
            });
        }

        res.status(200).send({
            status: {
                code: 200,
                message: 'User deleted successfully'
            },
            data: {}
        });
    } catch (error) {
        console.error('Error deleting user:', error);
        res.status(500).send({
            status: {
                code: 500,
                message: 'Internal server error occurred'
            },
            data: {
                error: error.message
            }
        });
    }
});

router.post('/app-events', userAuth, async (req, res) => {
    const task = req.body.task;
    if (task.includes('FIND_USER_BY_ID_TOKEN')) {
        try {
            const user = await User.findOne({ _id: req.body.decoded._id, 'tokens.token': req.body.token });
            if (user === null || user === '' || user === undefined || !user) {
                return res.status(400).send({
                    status: {
                        code: 400,
                        message: 'user not found'
                    }
                });
            }
            else {
                return res.status(200).send({
                    status: 200,
                    data: {
                        user: user
                    }
                })
            }
        }
        catch (error) {
            return res.status(400).send({
                status: {
                    code: 400,
                    message: 'user not found'
                }
            });
        }
    }
});
module.exports = router