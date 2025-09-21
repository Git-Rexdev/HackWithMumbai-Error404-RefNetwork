// utils/jwt.js
const jwt = require('jsonwebtoken');

/**
 * Generate a JWT token for a user.
 * @param {string} userId 
 * @param {string} role 
 * @returns {string}
 */
const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET, 
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

/**
 * Verify a JWT token and return the decoded payload.
 * @param {string} token 
 * @returns {Object} 
 * @throws {Error} 
 */
const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET || 'defaultsecret');
};

module.exports = generateToken;
module.exports.verifyToken = verifyToken;
