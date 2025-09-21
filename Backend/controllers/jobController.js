const Job = require('../models/Job');

exports.createJob = async (req, res, next) => {
  try {
    if (!['employee', 'admin'].includes(req.userRole)) {
      return res.status(403).json({ message: 'Only employees or admins can create jobs' });
    }

    const { title, company, description, location, deadline, skills, url } = req.body;

    if (!title || !company || !description || !deadline) {
      return res.status(400).json({ message: 'Title, company, description and deadline are required' });
    }

    const job = await Job.create({
      title,
      company,
      description,
      location: location || "",
      deadline,
      skills: skills || [],
      url: url || "",
      createdBy: req.userId,
      isApproved: false // Always require admin approval
    });

    res.status(201).json({
      success: true,
      message: 'Job created successfully',
      job
    });
  } catch (err) {
    console.error("Error creating job:", err);
    next(err);
  }
};

exports.approveJob = async (req, res, next) => {
  try {
    if (req.userRole !== 'admin') {
      return res.status(403).json({ message: 'Only admin can approve jobs' });
    }
    const job = await Job.findByIdAndUpdate(req.params.id, { isApproved: true }, { new: true });
    res.json({ success: true, job });
  } catch (err) {
    next(err);
  }
};

exports.listJobs = async (req, res, next) => {
  try {
    const query = { isApproved: true, deadline: { $gte: new Date() } };
    const jobs = await Job.find(query).sort({ createdAt: -1 });
    res.json({ success: true, jobs });
  } catch (err) {
    next(err);
  }
};

exports.getJob = async (req, res, next) => {
  try {
    const jobId = req.params.id;
    if (!jobId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ success: false, message: 'Invalid job ID format' });
    }
    const job = await Job.findById(jobId)
      .populate('createdBy', 'name email role publicKey');
    if (!job) {
      return res.status(404).json({ success: false, message: 'Job not found' });
    }
    res.status(200).json({
      success: true,
      message: 'Job fetched successfully',
      job
    });
  } catch (err) {
    console.error("Error fetching job:", err);
    next(err);
  }
};
