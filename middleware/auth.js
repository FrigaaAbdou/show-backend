// middleware/auth.js
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // to fetch user role from DB if needed

module.exports = async function (req, res, next) {
  try {
    // Expect an Authorization header with the format "Bearer <token>"
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Invalid token format' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Option A: If you store role in the token at login time, you can do:
    // req.user = { id: decoded.id, role: decoded.role };

    // Option B: If your token only has { id }, fetch user from DB to get role
    const user = await User.findById(decoded.id).select('role');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    req.user = { id: decoded.id, role: user.role };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Unauthorized' });
  }
};