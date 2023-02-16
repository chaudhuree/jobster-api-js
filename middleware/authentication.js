const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { UnauthenticatedError } = require('../errors');

const auth = async (req, res, next) => {
  // check header
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer')) {
    throw new UnauthenticatedError('Authentication invalid');
  }
  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    //docs: coded for jobster project,
    // attach the user to the job routes
    const testUser = payload.userId === '62f801d0510a7c1ed2312d52'; //update id as needed
    //🔼🔼 when testUser login, then payload.userId will be '62f801d0510a7c1ed2312d52'
    //and we compare payload.userId with '62f801d0510a7c1ed2312d52' to see if it is testUser
    //🔼🔼 if it is testUser, then testUser will be true, otherwise it will be false
    //🔽🔽 if it is testUser then we attach the testUser to the req.user
    req.user = { userId: payload.userId, testUser };
    next();
  } catch (error) {
    throw new UnauthenticatedError('Authentication invalid');
  }
};

module.exports = auth;
