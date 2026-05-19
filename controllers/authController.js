const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByEmail, findUserByUsername, createUser } = require('../config/db');

const register = async (req, res) => {
  const { username, email, password } = req.body;
  
  if (!username || !email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Username, email, and password are required.'
    });
  }
  
  if (password.length < 6) {
    return res.status(400).json({
      success: false,
      message: 'Password must be at least 6 characters long.'
    });
  }
  
  const existingEmail = findUserByEmail(email);
  if (existingEmail) {
    return res.status(400).json({
      success: false,
      message: 'Email already registered.'
    });
  }
  
  const existingUsername = findUserByUsername(username);
  if (existingUsername) {
    return res.status(400).json({
      success: false,
      message: 'Username already taken.'
    });
  }
  
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);
  
  const newUser = createUser({
    username,
    email,
    password: hashedPassword
  });
  
  req.logger.info(`Register Success - New user registered: ${username} (${email})`);
  
  const { password: _, ...userWithoutPassword } = newUser;
  
  res.status(201).json({
    success: true,
    message: 'User registered successfully.',
    data: userWithoutPassword
  });
};

const login = async (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required.'
    });
  }
  
  const user = findUserByEmail(email);
  
  if (!user) {
    req.logger.warn(`Login Failed - Email not found: ${email}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }
  
  const isValidPassword = await bcrypt.compare(password, user.password);
  
  if (!isValidPassword) {
    req.logger.warn(`Login Failed - Invalid password for email: ${email}`);
    return res.status(401).json({
      success: false,
      message: 'Invalid email or password.'
    });
  }
  
  const token = jwt.sign(
    { 
      id: user.id, 
      email: user.email, 
      username: user.username 
    },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '30m' }
  );
  
  req.logger.info(`Login Success - User logged in: ${user.username} (${user.email})`);
  
  res.json({
    success: true,
    message: 'Login successful.',
    data: {
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    }
  });
};

module.exports = {
  register,
  login
};