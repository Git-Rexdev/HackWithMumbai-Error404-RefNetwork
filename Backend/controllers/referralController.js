// Employee: Get all referrals for jobs created by them
exports.getReferralsForEmployeeJobs = async (req, res, next) => {
  try {
    if (req.userRole !== 'employee') {
      return res.status(403).json({ success: false, message: 'Only employees can view their job referrals' });
    }

    // Find jobs created by this employee
    const jobs = await Job.find({ createdBy: req.userId }).select('_id');
    const jobIds = jobs.map(job => job._id);

    // Find referrals for these jobs
    const referrals = await Referral.find({ job: { $in: jobIds } })
      .populate('candidate', 'name email role')
      .populate('job', 'title company location deadline')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: referrals.length, referrals });
  } catch (err) {
    next(err);
  }
};
const Referral = require('../models/Referral');
const Job = require('../models/Job');

exports.createReferral = async (req, res, next) => {
  try {
    const { jobId, candidateName, candidateEmail, notes } = req.body;

    if (!req.file) {
      return res.status(400).json({ message: 'Resume file is required' });
    }

    const job = await Job.findById(jobId);
    if (!job) return res.status(404).json({ message: 'Job not found' });

    const referral = await Referral.create({
      job: job._id,
      candidateName,
      candidateEmail,
      notes,
      referredBy: req.userId,
      resumeFileName: req.file.filename,
      resumePath: req.file.path
    });

    res.status(201).json({ success: true, referral });
  } catch (err) {
    next(err);
  }
};

exports.applyForJob = async (req, res, next) => {
  try {
    // Only freshers can apply
    if (req.userRole !== 'fresher') {
      return res.status(403).json({ success: false, message: 'Only freshers can apply for jobs' });
    }

  const jobId = req.body.jobId;
    const { fullName, coverLetter, whyBetter } = req.body;

    if (!jobId || !fullName || !whyBetter) {
      return res.status(400).json({
        success: false,
        message: 'jobId, fullName, and whyBetter are required'
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Resume PDF is required' });
    }

    const job = await Job.findById(jobId);
    if (!job || !job.isApproved) {
      return res.status(404).json({ success: false, message: 'Job not available or not approved' });
    }

    const referral = await Referral.create({
      job: job._id,
      candidate: req.userId,
      fullName,
      coverLetter: coverLetter || null,
      whyBetter,
      resumeFileName: req.file.filename,
      resumePath: req.file.path,
      status: 'pending'
    });

    res.status(201).json({
      success: true,
      message: 'Application submitted successfully',
      referral
    });
  } catch (err) {
    console.error('Error applying for job:', err);
    next(err);
  }
};


exports.getReferralsForUser = async (req, res, next) => {
  try {
    const referrals = await Referral.find({ candidate: req.userId })
      .populate('job', 'title company location deadline')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: referrals.length, referrals });
  } catch (err) {
    next(err);
  }
};

exports.updateReferralStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!['pending', 'accepted', 'rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const referral = await Referral.findById(req.params.id);
    if (!referral) return res.status(404).json({ message: 'Referral not found' });

    if (req.userRole !== 'employee' && req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Not authorized' });
    }

    referral.status = status;
    await referral.save();

    res.json({ success: true, referral });
  } catch (err) {
    next(err);
  }
};

exports.getUnapprovedJobs = async (req, res, next) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ success: false, message: 'Only admins can view unapproved jobs' });
    }

    const jobs = await Job.find({ isApproved: false })
      .populate('createdBy', 'name email role')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: jobs.length,
      jobs
    });
  } catch (err) {
    console.error('Error fetching unapproved jobs:', err);
    next(err);
  }
};
// Fetch all student applications (Admin/Employee only)
exports.getAllStudentApplications = async (req, res, next) => {
  try {
    if (req.userRole !== 'admin' && req.userRole !== 'employee') {
      return res.status(403).json({
        success: false,
        message: 'Only admins or employees can view all applications'
      });
    }

    const referrals = await Referral.find()
      .populate('candidate', 'fullName email')  // student info
      .populate('job', 'title company location deadline') // job info
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: referrals.length,
      referrals
    });
  } catch (err) {
    console.error('Error fetching all student applications:', err);
    next(err);
  }
};
