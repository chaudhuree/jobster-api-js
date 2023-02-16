#### Modify Job Model

- add following properties

models/Job.js

```js
jobType: {
      type: String,
      enum: ['full-time', 'part-time', 'remote', 'internship'],
      default: 'full-time',
    },
    jobLocation: {
      type: String,
      default: 'my city',
      required: true,
    },
```

- default property just for example case, values will be provided by front-end

#### Setup Mock Data

> see the phote in the root folder named "mockaroo.png"

- [Mockaroo](https://www.mockaroo.com/)
- create mock-data.json (root)
- provide test user id

#### Populate DB

- create populate.js

populate.js

```js
require("dotenv").config();

const mockData = require("./mock-data.json");

const Job = require("./models/Job");
const connectDB = require("./db/connect");

const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI);

    await Job.create(mockData);
    console.log("Success!!!");
    process.exit(0);
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();
```
