const jwt = require('jsonwebtoken');
const { findUserById } = require('../config/db');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    req.logger.warn(`Security Warning: Protected route accessed without token - ${req.method} ${req.path} from ${req.ip}`);
    return res.status(401).json({
      success: false,
      message: 'Access denied. No token provided.'
    });
  }
  
  const token = authHeader.split(' ')[1];
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = findUserById(decoded.id);
    
    if (!user) {
      req.logger.warn(`Security Warning: Invalid token - user not found for ID ${decoded.id}`);
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }
    
    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      req.logger.warn(`Security Warning: Expired token used - ${req.method} ${req.path}`);
      return res.status(401).json({
        success: false,
        message: 'Token has expired.'
      });
    }
    
    req.logger.warn(`Security Warning: Invalid token - ${error.message}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid token.'
    });
  }
};

module.exports = authMiddleware;