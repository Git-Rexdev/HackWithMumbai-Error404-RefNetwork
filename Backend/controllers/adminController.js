const User = require('../models/User');
const Job = require('../models/Job');
const Referral = require('../models/Referral');

exports.getAllLogs = async (req, res, next) => {
  try {
    if (req.userRole !== 'admin') return res.status(403).json({ message: 'Admin only' });

    const users = await User.find().select('-password');
    const jobs = await Job.find();
    const referrals = await Referral.find().populate('job candidate', 'title email name');

    res.json({ success: true, logs: { users, jobs, referrals } });
  } catch (err) {
    next(err);
  }
};
