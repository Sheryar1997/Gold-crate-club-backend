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

// Endpoint to retrieve plans
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

app.get('/get-account', async (req, res) => {

  try {
    const subscripitonArray = []
    const accountCode = 'code-' + req.query.accountCode;
  
    const subscriptions = client.listAccountSubscriptions(accountCode, { params: { limit: 200 } })
    
    for await (const subscription of subscriptions.each()) {
      console.log(subscription)
      subscripitonArray.push(subscription);
    }
    
    res.status(200).send(subscripitonArray);  
  } catch (error) {
    console.log('Error while fetching subscription of an account == ', error );
    res.status(500).json({ error: 'Failed to fetch subscription of an account' });
  }
  
  


  // try {
  //   const account = await client.getAccount(accountCode)
  //   console.log('Fetched account: ', account)
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

//Endpoint to create subscription 
app.post('/create-account', async (req, res) => {
  try {
     let subscriptionReq = {
       plan_code: req.body.planCode,
       currency: `USD`,
       account: {
         code: req.body.email,
         billing_info: {
           token_id: req.body.recurlyToken.id,
         }
       },
       shipping: {
        address: {
          first_name: req.body.firstName,
          last_name: req.body.lastName,
          street1: req.body.address,
          city: req.body.city,
          region: req.body.selectedRegion,
          postal_code: req.body.zip,
          country: req.body.selectedCountry
        }
       },
     }

     if (req.body.couponCode) {
      subscriptionReq.coupon_codes = [req.body.couponCode];
    }
    console.log(subscriptionReq);


     let sub = await client.createSubscription(subscriptionReq);
     console.log('Created subscription:', sub.uuid);
     res.status(200).json({ success: true, uuid: sub.uuid });
  } catch (err) {
    console.error('Error creating subscription:', err.message);
    if (err instanceof recurly.errors.ValidationError) {
      console.error('Failed validation:', err.params);
      res.status(400).json({ error: 'Validation error', details: err.params });
    } else {
      console.error('Unknown error:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
 });

 //Fetch single coupon based on coupon code 
 app.get('/get-coupon', async (req, res) => {
  try {
    const couponParam = 'code-' + req.query.couponParam;
    
    const coupon = await client.getCoupon(couponParam);
    
    if (coupon) {
      console.log('Fetched coupon: ', coupon);
      res.json(coupon);
    } else {
      console.log('Coupon not found');
      res.status(404).json({ error: 'Coupon not found' });
    }
  } catch (err) {
    if (err instanceof recurly.errors.NotFoundError) {
      console.log('Resource Not Found');
      res.status(404).json({ error: 'Resource not found' });
    } else {
      console.log('Unknown Error: ', err);
      res.status(500).json({ error: 'Server Error' });
    }
  }
});

app.post('/apple-pay-payment-info', (req, res) => {
  console.log('Received payment object:', req.body);
  res.send({ success: true, message: 'Payment object received successfully' });
});



app.listen(port, () => {
  console.log(`Server is listening at http://localhost:${port}`);
});
