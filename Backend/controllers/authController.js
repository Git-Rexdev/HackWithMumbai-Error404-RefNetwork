const User = require('../models/User');
const Otp = require('../models/Otp');
const generateToken = require('../utils/jwt');
const bcrypt = require('bcryptjs');

exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Missing required fields' });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: 'Email already in use' });

    // Only allow "fresher" or "employee" from frontend
    let userRole = 'fresher';
    if (role && ['fresher', 'employee'].includes(role)) {
      userRole = role;
    }

    let resumePath = null;
    if (req.file) {
      resumePath = path.join('uploads', req.file.filename);
    }

    const user = await User.create({
      name,
      email,
      password,
      role: userRole,
      isVerified: false,
      resume: resumePath
    });

    // Background resume parsing
    if (resumePath) {
      parseResumeJob(user._id, resumePath);
    }

    res.status(201).json({ message: `User registered as ${userRole}. Please verify email with OTP.` });
  } catch (err) {
    next(err);
  }
};

// Login only if verified
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    if (!user.isVerified) {
      return res.status(403).json({ message: 'Please verify your email first' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) return res.status(401).json({ message: 'Invalid credentials' });

    res.json({
      token: generateToken(user._id, user.role),
      user: { id: user._id, email: user.email, name: user.name, role: user.role }
    });
  } catch (err) {
    next(err);
  }
};

// Current user info
exports.me = async (req, res, next) => {
  try {
    const user = await User.findById(req.userId).select('-password');
    res.json({ user });
  } catch (err) {
    next(err);
  }
};
