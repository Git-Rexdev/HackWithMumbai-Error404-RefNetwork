const express = require('express');
const { getAllLogs } = require('../controllers/adminController');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/logs', auth, getAllLogs);

module.exports = router;
