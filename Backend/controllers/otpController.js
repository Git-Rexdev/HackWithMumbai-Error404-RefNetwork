const Otp = require('../models/Otp');
const User = require('../models/User');
const { sendEmail } = require('../utils/email');
const bcrypt = require('bcryptjs');

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP
exports.sendOtp = async (req, res, next) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ message: 'Email is required' });

    const otp = generateOTP();
    const hashedOtp = await bcrypt.hash(otp, 10);

    await Otp.create({ email, otp: hashedOtp });

    await sendEmail({
      to: email,
      subject: 'Your OTP Code',
      template: 'otp', // views/otp.hbs
      context: { otp }
    });

    res.json({ message: 'OTP sent' });
  } catch (err) {
    next(err);
  }
};

// Verify OTP
exports.verifyOtp = async (req, res, next) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ message: 'Email and OTP required' });

    const records = await Otp.find({ email });
    if (!records.length) return res.status(400).json({ message: 'Invalid or expired OTP' });

    let isMatch = false;
    for (let record of records) {
      if (await bcrypt.compare(otp, record.otp)) {
        isMatch = true;
        break;
      }
    }

    if (!isMatch) return res.status(400).json({ message: 'Invalid or expired OTP' });

    await Otp.deleteMany({ email }); // clear OTPs
    await User.findOneAndUpdate({ email }, { isVerified: true });

    res.json({ message: 'OTP verified. Email confirmed.' });
  } catch (err) {
    next(err);
  }
};
