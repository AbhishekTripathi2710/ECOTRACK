const userModel = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const blacklistTokenModel = require('../models/blacklistTokenModel');

module.exports.authUser = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized - No token provided' });
        }

        // Check if token is blacklisted
        const isBlacklisted = await blacklistTokenModel.findOne({ token: token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Unauthorized - Token is blacklisted' });
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
        console.error('Auth Error:', err);
        return res.status(401).json({ message: 'Unauthorized - Invalid token' });
    }
};

exports.protect = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await userModel.findById(decoded._id);
            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: 'Not authorized to access this route'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Server Error'
        });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                error: `User role ${req.user.role} is not authorized to access this route`
            });
        }
        next();
    };
};
