const express = require('express');
const router = express.Router();
const authenticateUser = require('../middleware/authentication');
//docs: coded for jobster project
const testUser = require('../middleware/testUser');

const rateLimiter = require('express-rate-limit');

//it will check if user hits the api more than 10 times in 15 minutes then it will block the user for 15 minutes
//this is to prevent brute force attack
const apiLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    msg: 'Too many requests from this IP, please try again after 15 minutes',
  },
});

const { register, login, updateUser } = require('../controllers/auth');
router.post('/register', apiLimiter, register);
router.post('/login', apiLimiter, login);
router.patch('/updateUser', authenticateUser, testUser, updateUser);//protected with testUser middleware so that if it is testUser then it will not allow to update user
module.exports = router;
