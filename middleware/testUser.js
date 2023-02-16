const { BadRequestError } = require('../errors');

const testUser = (req, res, next) => {
  if (req.user.testUser) {
    throw new BadRequestError('Test User. Read Only');
  }
  next();
};

module.exports = testUser;
//from middleware\authentication.js, we get req.user.testUser
//if req.user.testUser is true, then we throw new BadRequestError('Test User. Read Only');
//if req.user.testUser is false, then we go to next()