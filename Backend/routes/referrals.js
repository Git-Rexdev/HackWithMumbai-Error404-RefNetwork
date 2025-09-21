const express = require('express');
const upload = require('../middlewares/uploadMiddleware');
const {
  createReferral,
  getReferralsForUser,
  updateReferralStatus,
  applyForJob,
  getAllStudentApplications,
  getUnapprovedJobs
} = require('../controllers/referralController');
const auth = require('../middlewares/authMiddleware');  
const router = express.Router();

router.get('/employee/jobs', auth, require('../controllers/referralController').getReferralsForEmployeeJobs);
router.post('/', auth, upload.single('resume'), createReferral);
router.post('/apply', auth, upload.single('resume'), applyForJob);
router.get('/me', auth, getReferralsForUser);
router.patch('/:id/status', auth, updateReferralStatus);
router.get('/applications', auth, getAllStudentApplications);   
router.get('/jobs/unapproved', auth, getUnapprovedJobs);       

module.exports = router;
