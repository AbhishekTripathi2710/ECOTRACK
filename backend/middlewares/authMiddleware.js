const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('../models/blacklistTokenModel');

module.exports.authUser = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Check if token is blacklisted
        const isBlacklisted = await blacklistTokenModel.findOne({ token: token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from DB
        const user = await userModel.findById(decoded._id);
        if (!user) {
            return res.status(401).json({ message: 'Unauthorized - User Not Found' });
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ message: 'Unauthorized' });
    }
};
