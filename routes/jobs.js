const express = require('express');
const testUser = require('../middleware/testUser');

const router = express.Router();
const {
  createJob,
  deleteJob,
  getAllJobs,
  updateJob,
  getJob,
  showStats,
} = require('../controllers/jobs');

router.route('/').post(testUser, createJob).get(getAllJobs);
router.route('/stats').get(showStats);

router
  .route('/:id')
  .get(getJob)
  .delete(testUser, deleteJob)
  .patch(testUser, updateJob);
//🔼🔼 we are protecting all the routes with testUser middleware so that if it is testUser then it will not allow to create, delete, update job
module.exports = router;
