require('dotenv').config();
const express = require('express');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const jobsRoutes = require('./routes/jobs');
const referralsRoutes = require('./routes/referrals');
const errorHandler = require('./middlewares/errorHandler');
const otpRoutes = require('./routes/otp');
const chatRoutes = require('./routes/chat');
const adminRoutes = require('./routes/admin');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.send('MERN Referral Backend'));

app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobsRoutes);
app.use('/api/referrals', referralsRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandler);

module.exports = app;