const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware to verify JWT tokens
 * This middleware checks if the user is authenticated before allowing access to protected routes
 */
const auth = async (req, res, next) => {
  try {
    // Get the token from the Authorization header
    const authHeader = req.header('Authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const token = authHeader.replace('Bearer ', '');
    
    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
    
    // Find the user using _id from the token
    const user = await User.findById(decoded._id).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    
    // Add the user to the request object
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = auth; 