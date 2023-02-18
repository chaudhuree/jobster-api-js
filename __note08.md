#### Setup Stats Route

controllers/jobs

```js
const showStats = (req, res) => {
  res
    .status(StatusCodes.OK)
    .json({ defaultStats: {}, monthlyApplications: [] });
};

module.exports = {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
  showStats,
};
```

routes/jobs.js

```js
const express = require("express");

const router = express.Router();
const {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
  showStats,
} = require("../controllers/jobs");

router.route("/").post(createJob).get(getAllJobs);
router.route("/stats").get(showStats);
router.route("/:id").get(getJob).delete(deleteJob).patch(updateJob);

module.exports = router;
```

- npm install moment
- import mongoose and moment
- moment is used to format date

controllers/jobs

```js
const mongoose = require("mongoose");
const moment = require("moment");
```

controllers/jobs

> details are given in the jobs controller in comments

```js
const showStats = async (req, res) => {
  let stats = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);

  stats = stats.reduce((acc, curr) => {
    const { _id: title, count } = curr;
    acc[title] = count;
    return acc;
  }, {});

  const defaultStats = {
    pending: stats.pending || 0,
    interview: stats.interview || 0,
    declined: stats.declined || 0,
  };

  let monthlyApplications = await Job.aggregate([
    { $match: { createdBy: mongoose.Types.ObjectId(req.user.userId) } },
    {
      $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.year": -1, "_id.month": -1 } },
    { $limit: 6 },
  ]);
  monthlyApplications = monthlyApplications
    .map((item) => {
      const {
        _id: { year, month },
        count,
      } = item;
      const date = moment()
        .month(month - 1)
        .year(year)
        .format("MMM Y");
      return { date, count };
    })
    .reverse();

  res.status(StatusCodes.OK).json({ defaultStats, monthlyApplications });
};
```

#### Deploy

- add reverse() in showStats

controllers/jobs.js

```js
monthlyApplications = monthlyApplications
  .map((item) => {
    const {
      _id: { year, month },
      count,
    } = item;
    const date = moment()
      .month(month - 1)
      .year(year)
      .format("MMM Y");
    return { date, count };
  })
  .reverse();
```

- remove engines from package.json

```json
"engines": {
    "node": "16.x"
  }
```

- fix build folder (remove /build from client/.gitignore)
- setup new github repo
- deploy to render
