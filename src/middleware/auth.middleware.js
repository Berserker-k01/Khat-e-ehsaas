const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const protectAPI = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            return res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }
    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const protectView = (req, res, next) => {
    // A proper implementation would use cookies. 
    // For now, our client-side JS handles the redirect logic.
    next();
};

module.exports = { protectAPI, protectView };