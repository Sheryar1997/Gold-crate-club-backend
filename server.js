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

app.use(cors({
  origin: "*", // Allow all origins
  credentials: true, // Allow cookies
}));

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
       plan_code: req.body.planCode,
       currency: `USD`,
       account: {
         code: accountCode,
         billing_info: {
           token_id: req.body.recurlyToken.id,
         }
       },
       coupon_codes: [req.body.couponCode]
     }
     let sub = await client.createSubscription(subscriptionReq)
     console.log('Created subscription: ', sub.uuid)
     res.status(200).send(true);
  } catch (err) {
     console.error('Error creating subscription:', err); // Logging the entire error object
     if (err instanceof recurly.errors.ValidationError) {
       console.log('Failed validation', err.params)
     } else {
       console.log('Unknown Error: ', err)
     }
     res.status(500).send('Server Error');
  }
 });
//  app.post('/check-coupon', async (req, res) => {
//   try {
//     // Assuming `client` is defined elsewhere

//     // Attempt to create a coupon redemption
//     let couponRedemption = await client.createCouponRedemption('code-elplogga1990@gmail.com', req.body);

//     // Log the coupon redemption
//     console.log(couponRedemption);

//     // Send the coupon redemption details as the response
//     res.status(200).send(couponRedemption);
//   } catch (error) {
//     // Handle errors
//     console.error('Error creating coupon redemption:', error);
//     res.status(500).send('Error creating coupon redemption');
//   }
// });


 app.get('/get-coupons', async (req, res) => {

  try {
    let couponsArr = []
    const coupons = client.listCoupons({ params: { limit: 200 } })
    for await (const coupon of coupons.each()) {
      couponsArr.push(coupon)
    }
    console.log(couponsArr);
    res.status(200).send(couponsArr);
  } catch (error) {
    
  }

 });
 

app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
