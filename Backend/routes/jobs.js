const express = require('express');
const { createJob, listJobs, getJob, approveJob } = require('../controllers/jobController');
const auth = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/', auth, createJob);          
router.patch('/:id/approve', auth, approveJob);
router.get('/', listJobs);           
router.get('/:id', getJob);       

module.exports = router;
