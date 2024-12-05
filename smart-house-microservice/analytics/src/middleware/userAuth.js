const jwt = require('jsonwebtoken');
const axios = require('axios');

const userAuth = async (req, res, next) => {
    try {
        const token = req.header('Authorization').replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check for token expiration
        const currentTime = Date.now();
        const tokenStartTime = decoded.startDate;
        const expirationTime = 60 * 60 * 1000; // 60 minutes in milliseconds
        if (currentTime - tokenStartTime > expirationTime) {
            user.tokens = user.tokens.filter((token1) => {
                return token1.token !== token
            });
            await user.save()
            return res.status(401).send({
                status: {
                    code: 401,
                    message: 'Token expired. Please log in again.'
                },
                data: {}
            });
        }
        console.log(process.env.USER_URL);
        // Find user with the token
        const res = await axios.post(`${process.env.USER_URL}/app-events`, {
            task: 'FIND_USER_BY_ID_TOKEN',
            decoded: decoded,
            token: token
        }, { headers: {
            'Authorization':req.header('Authorization')
        } });
        const user =res.data.data.user;
        user._id = decoded._id;
        if (!user) {
            throw new Error();
        }

        req.token = token;
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).send({
            status: {
                code: 401,
                message: 'Unauthorized access'
            },
            data: {}
        });
    }
};

module.exports = userAuth;
