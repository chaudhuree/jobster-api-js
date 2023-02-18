# Jobster API

> its the updated version of jobs api

#### Setup

- install dependencies

```sh
npm install
```

- create .env and provide correct values
- you can copy from previous project (just change the DB name)

.env

```js
MONGO_URI=
JWT_SECRET=
JWT_LIFETIME=
```

- start the project

```sh
npm start
```

- server console will show  "Server is listening ...." text

#### Spring Cleaning

```js
app.get("/", (req, res) => {
  res.send("<h1>Jobs API</h1>");
});
```

#### Remove API Limiter

- remove these lines of code

app.js

```js
const rateLimiter = require("express-rate-limit");

app.set("trust proxy", 1);
app.use(
  rateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
  })
);
```

> we will use it in diractly auth route to prevent spamming

#### Remove CORS

- we don't want external JS apps to access our API (only our front-end)
- remove these lines of code

```js
const cors = require("cors");
app.use(cors());
```

#### Package.json

- add "startDev" script with nodemon
- change engines to current version (in my case 16)

package.json

```js

"scripts": {
    "start": "node app.js",
    "startDev": "nodemon app.js"
  },

"engines": {
    "node": "16.x"
  }
```

- restart server with "npm run startDev"

##### Client Folder

- open client folder

utils/axios.js

```js
const customFetch = axios.create({
  baseURL: "/api/v1", //or "http://localhost:8000/api/v1"
});
```

- notice the build folder (production ready application)
- in CRA we can create build folder by running "npm run build"
- that's the one we will use for our front-end

##### Setup Front-End

- require "path" module
- setup express static (as first middleware)
  to serve static assets from client/build
- so now instead of public folder we are using client/build
- by this way all the static assets will be served from client/build like, css, js, images, etc

app.js

```js
const path = require("path");

app.use(express.static(path.resolve(__dirname, "./client/build")));

// place as first middleware
app.use(express.json());
app.use(helmet());
app.use(cors());
app.use(xss());
```

- serve index.html for all routes (apart from API)
- front-end routes pick's it up from there

```js
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/jobs", authenticateUser, jobsRouter);

// serve index.html
// now if you navigate to localhost:8000 you will see the front-end
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "./client/build", "index.html"));
});

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);
```

- navigate to localhost:8000
- clear local storage (if necessary)

#### Modify User Model

- add new properties to User model which were missing in jobs api
- add following properties lastname, location
- it has default values so we don't need to provide them in register

models/User.js

```js
lastName: {
    type: String,
    trim: true,
    maxlength: 20,
    default: 'lastName',
  },
  location: {
    type: String,
    trim: true,
    maxlength: 20,
    default: 'my city',
  },

```

#### Modify Response in Register and Login

- change the response structure in
  register and login controllers (just keep old StatusCodes)

controllers/auth.js

```js
res.status(StatusCodes.CREATED).json({
  user: {
    email: user.email,
    lastName: user.lastName,
    location: user.location,
    name: user.name,
    token,
  },
});
```

- Login and Register Works Now :):):)
