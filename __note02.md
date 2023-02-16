#### Create Test User

- test front-end request
- in postman or front-end
- make sure email and password are the same (or change the front-end)

```js
{
    "name":"demo user",
    "email":"testUser@test.com",
    "password":"secret"
}
```

- need to be the same because with this we have send and receive request in font-end
- navigate to client/src/pages/Register.js
- make sure email and password match your test user

```js
<button
  type='button'
  className='btn btn-block btn-hipster'
  disabled={isLoading}
  onClick={() =>
  dispatch(loginUser({ email: 'testUser@test.com', password: 'secret' }))}>

```

#### Update User Functionality

- import authenticateUser middleware
- setup updateUser route (protected route)

routes/auth.js

```js
const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");
const { register, login, updateUser } = require("../controllers/auth");
router.post("/register", register);
router.post("/login", login);
router.patch("/updateUser", authenticateUser, updateUser);

module.exports = router;
```

#### Make Test User Read-Only

middleware/authentication.js

```js
const payload = jwt.verify(token, process.env.JWT_SECRET);
const testUser = payload.userId === "62eff8bcdb9af70b4155349d";
req.user = { userId: payload.userId, testUser };
```

- create testingUser in middleware

middleware/testUser

```js
const { BadRequestError } = require("../errors");

const testUser = (req, res, next) => {
  if (req.user.testUser) {
    throw new BadRequestError("Test User. Read Only!");
  }
  next();
};

module.exports = testUser;
```

- add to auth routes (updateUser)

```js
const express = require("express");
const router = express.Router();
const authenticateUser = require("../middleware/authentication");
const testUser = require("../middleware/testUser");
const { register, login, updateUser } = require("../controllers/auth");

router.post("/register", register);
router.post("/login", login);
router.patch("/updateUser", authenticateUser, testUser, updateUser);

module.exports = router;
```

- add to job routes (createJob, updateJob, deleteJob)

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
const testUser = require("../middleware/testUser");

router.route("/").post(testUser, createJob).get(getAllJobs);
router.route("/stats").get(showStats);
router
  .route("/:id")
  .get(getJob)
  .delete(testUser, deleteJob)
  .patch(testUser, updateJob);

module.exports = router;
```
