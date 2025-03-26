const User = require('../models/userModel');
const {validationResult} = require('express-validator');
const userService = require('../services/userServices')
const blacklistTokenModel = require('../models/blacklistTokenModel')

// Register user
exports.register = async (req, res) => {
    try {
        const { email, password, fullname } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                error: 'User already exists'
            });
        }

        // Hash password
        const hashedPassword = await User.hashPassword(password);

        // Create user
        const user = await User.create({
            email,
            password: hashedPassword,
            fullname
        });

        // Generate token
        const token = user.generateAuthToken();

        res.status(201).json({
            success: true,
            data: {
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    fullname: user.fullname
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Login user
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: 'Invalid credentials'
            });
        }

        // Generate token
        const token = user.generateAuthToken();

        res.status(200).json({
            success: true,
            data: {
                token,
                user: {
                    _id: user._id,
                    email: user.email,
                    fullname: user.fullname
                }
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { email, fullname, currentPassword, newPassword } = req.body;
        const user = await User.findById(req.user._id).select('+password');

        // Update email if provided
        if (email) {
            const existingUser = await User.findOne({ email });
            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                return res.status(400).json({
                    success: false,
                    error: 'Email already in use'
                });
            }
            user.email = email;
        }

        // Update name if provided
        if (fullname) {
            user.fullname = fullname;
        }

        // Update password if provided
        if (currentPassword && newPassword) {
            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                return res.status(401).json({
                    success: false,
                    error: 'Current password is incorrect'
                });
            }
            user.password = await User.hashPassword(newPassword);
        }

        await user.save();

        res.status(200).json({
            success: true,
            data: {
                _id: user._id,
                email: user.email,
                fullname: user.fullname
            }
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
};

module.exports.logoutUser = async(req,res,next)=>{
    res.clearCookie('token');
    const token = req.cookies.token || req.headers.authorization.split(' ')[1];

    await blacklistTokenModel.create({token});
    res.status(200).json({message:'Logged out'});
}