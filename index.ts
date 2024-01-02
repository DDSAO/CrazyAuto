import express, { Request, Response } from 'express';
import cron from "node-cron";
import { syncOrders } from './methods/syncOrders';

const app = express();
const port = process.env.PORT || 4999;

cron.schedule('* * * * *', () => {
  (async () => {

    let response = await syncOrders()
    console.log(response)
  })()
});



app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});