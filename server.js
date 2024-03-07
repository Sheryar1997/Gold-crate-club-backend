const express = require('express');
require("dotenv").config();
const recurly = require('recurly');
const cors = require('cors');
const app = express();
const { v4: uuidv4 } = require('uuid');
app.use(express.json());
const apiKey = process.env.API_KEY;
const client = new recurly.Client(apiKey);
const port = process.env.PORT;

app.use(cors());
const accountCode = uuidv4();

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
});

// Endpoint to create a Recurly account
// app.post('/create-account', async (req, res) => {
//   console.log(req.body);
//   const accountCode = uuidv4();
//   //const { country, firstName, lastName, address, apartment, city, region, zip, recurlyToken  } = req.body;

//   // const accountCreate = {
//   //   code: accountCode,
//   //   firstName: firstName,
//   //   lastName: lastName,
//   //   preferredTimeZone: 'America/Guatemala',
//   //   address: {
//   //     street1: address,
//   //     city: city,
//   //     region: region,
//   //     postalCode: zip,
//   //     country: country
//   //   },
//   //   billing_info:{
//   //     token_id: recurlyToken
//   //   }
//   // };

//   // try {
//   //   const account = await client.createAccount(accountCreate);
//   //   console.log('Created Account: ', account.code);
//   //   res.status(201).json({ message: 'Account created successfully', accountCode: account.code });
//   // } catch (error) {
//   //   console.error('Error creating account:', error);
//   //   if (error instanceof recurly.errors.ValidationError) {
//   //     res.status(400).json({ error: 'Validation failed', details: error.params });
//   //   } else {
//   //     res.status(500).json({ error: 'Internal server error' });
//   //   }
//   // }

//   try {
//     let subscriptionReq = {
//       plan_code: 'diamond',
//       currency: `USD`,
//       account: {
//         code: accountCode,
//         billing_info:{
//           token_id: req.body.recurlyToken.id,
//           address:{
//             country: 'US'
//           }
//         }
//       }
      

//     }
//     let sub = await client.createSubscription(subscriptionReq)
//     console.log('Created subscription: ', sub.uuid)
//   } catch (err) {
//     if (err instanceof recurly.errors.ValidationError) {
//       // If the request was not valid, you may want to tell your user
//       // why. You can find the invalid params and reasons in err.params
//       console.log('Failed validation', err.params)
//     } else {
//       // If we don't know what to do with the err, we should
//       // probably re-raise and let our web framework and logger handle it
//       console.log('Unknown Error: ', err)
//     }
//   }
  
// });

app.post('/create-account', async (req, res) => {
  console.log(req.body);
  //const accountCode = uuidv4();
 
  try {
     let subscriptionReq = {
       plan_code: 'diamond', // Changed to plan_code
       currency: `USD`,
       account: {
         code: accountCode, // Changed to account_code
         // Additional account information can be added here if available
         billing_info: {
           token_id: req.body.recurlyToken.id,
         }
       },
       // Example of adding subscription add-ons
     }
     let sub = await client.createSubscription(subscriptionReq)
     console.log('Created subscription: ', sub.uuid)
  } catch (err) {
     console.error('Error creating subscription:', err); // Logging the entire error object
     if (err instanceof recurly.errors.ValidationError) {
       console.log('Failed validation', err.params)
     } else {
       console.log('Unknown Error: ', err)
     }
  }
 });
 

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
