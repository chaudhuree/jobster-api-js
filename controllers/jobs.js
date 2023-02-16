const Job = require('../models/Job');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, NotFoundError } = require('../errors');
const mongoose = require('mongoose');
const moment = require('moment');

const getAllJobs = async (req, res) => {
  const { search, status, jobType, sort } = req.query;

  //first one should be createdBy so that we can get the jobs created by the logged in user only.
  const queryObject = {
    createdBy: req.user.userId,
  };

  if (search) {
    queryObject.position = { $regex: search, $options: 'i' };
  }
  if (status && status !== 'all') {
    queryObject.status = status;
  }
  if (jobType && jobType !== 'all') {
    queryObject.jobType = jobType;
  }
  let result = Job.find(queryObject); //we will not use await here as we will use await later on.
  //if we use await here, then we will get the result of the query and then we will sort it. but we want to sort it first and then get the result. so we will not use await here.

  if (sort === 'latest') {
    result = result.sort('-createdAt');
  }
  if (sort === 'oldest') {
    result = result.sort('createdAt');
  }
  if (sort === 'a-z') {
    result = result.sort('position');
  }
  if (sort === 'z-a') {
    result = result.sort('-position');
  }

  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  result = result.skip(skip).limit(limit);

  const jobs = await result; //now we will use await here as we have already sorted the result.

  //docs: countDocuments() is used to count the number of documents in a collection that match the query filter.
  const totalJobs = await Job.countDocuments(queryObject);
  const numOfPages = Math.ceil(totalJobs / limit);

  res.status(StatusCodes.OK).json({ jobs, totalJobs, numOfPages });
};
const getJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findOne({
    _id: jobId,
    createdBy: userId,
  });
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }
  res.status(StatusCodes.OK).json({ job });
};

const createJob = async (req, res) => {
  req.body.createdBy = req.user.userId;
  const job = await Job.create(req.body);
  res.status(StatusCodes.CREATED).json({ job });
};

const updateJob = async (req, res) => {
  const {
    body: { company, position },
    user: { userId },
    params: { id: jobId },
  } = req;

  if (company === '' || position === '') {
    throw new BadRequestError('Company or Position fields cannot be empty');
  }
  const job = await Job.findByIdAndUpdate(
    { _id: jobId, createdBy: userId },
    req.body,
    { new: true, runValidators: true }
  );
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }
  res.status(StatusCodes.OK).json({ job });
};

const deleteJob = async (req, res) => {
  const {
    user: { userId },
    params: { id: jobId },
  } = req;

  const job = await Job.findByIdAndRemove({
    _id: jobId,
    createdBy: userId,
  });
  if (!job) {
    throw new NotFoundError(`No job with id ${jobId}`);
  }
  res.status(StatusCodes.OK).send();
};

//docs: coded for jobster project 
const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } }, //match by created by because we only want the data for the logged in user.mongoose.Types.ObjectId(req.user.userId) is the id of the user, as the user id is only string  so to get the user object we have to use mongoose.Types.ObjectId(req.user.userId)
    { $group: { _id: '$status', count: { $sum: 1 } } },
  ]);
  //stats= [{_id: "pending", count: 22}, {_id: "interview", count: 25}, {_id: "declined", count: 26}]
  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});
  //return an abject. so acc is ana object here. curr is the current element while iteration. 
  //renamed the _id as title. as _id is the status. and status are pending, interview and declined.
  //now acc[title]=count.. that means. acc.pending=22, acc.interview=25, acc.declined=26
  //so the final result is acc= {pending: 22, interview: 25, declined: 26} and,
  //stats= {pending: 22, interview: 25, declined: 26}

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': -1, '_id.month': -1 } },
    { $limit: 6 },
  ]);
//monthlyApplications= [{_id: {year: 2021, month: 6}, count: 22}, {_id: {year: 2021, month: 5}, count: 25}, {_id: {year: 2021, month: 4}, count: 26}, {_id: {year: 2021, month: 3}, count: 27}, {_id: {year: 2021, month: 2}, count: 28}, {_id: {year: 2021, month: 1}, count: 29}]
  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format('MMM Y');
      return { date, count };
    })
    .reverse();
//monthlyApplications= [{date: "Jun 2021", count: 22}, {date: "May 2021", count: 25}, {date: "Apr 2021", count: 26}, {date: "Mar 2021", count: 27}, {date: "Feb 2021", count: 28}, {date: "Jan 2021", count: 29}]
  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};

module.exports = {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
  showStats,
};
