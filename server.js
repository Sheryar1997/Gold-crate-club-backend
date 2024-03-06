const express = require('express');
require("dotenv").config();
const recurly = require('recurly');
const cors = require('cors');
const app = express();
const port = process.env.PORT;
const client = new recurly.Client(process.env.API_KEY);
app.use(cors());

// Define endpoint to retrieve plans
app.get('/plans', async (req, res) => {
  try {
    let planArr = []
    const plans = await client.listPlans({ params: { limit: 200 } })
    for await (const plan of plans.each()) {
      planArr.push(plan)
    }
    res.status(200).send(planArr);
  } catch (error) {
    console.error('Error fetching plans:', error);
    res.status(500).json({ error: 'Failed to fetch plans' });
  }

  // try {
  //   const plan = await client.getPlan('code-diamond')
  //   console.log('Fetched plan: ', plan.code)
  //   res.status(200).json(plan);
  // } catch (err) {
  //   if (err instanceof recurly.errors.NotFoundError) {
  //     // If the request was not found, you may want to alert the user or
  //     // just return null
  //     console.log('Resource Not Found')
  //   } else {
  //     // If we don't know what to do with the err, we should
  //     // probably re-raise and let our web framework and logger handle it
  //     console.log('Unknown Error: ', err)
  //   }
  // }
});

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
