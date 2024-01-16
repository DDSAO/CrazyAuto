import express, { Request, Response } from "express";
import cron from "node-cron";
import { syncOrders } from "./jobs/syncOrders";
import { syncProducts } from "./jobs/syncProducts";
import {
  getDaysAgo,
  getNow,
  getTongtoolAppendix,
  sleep,
  toTimestamp,
} from "./jobs/utils";
import CryptoJS from "crypto-js";
import axios from "axios";
import { syncTongtoolProducts } from "./jobs/syncTongtoolProducts";
import { syncCustomers } from "./jobs/syncCustomers";
const app = express();
const port = process.env.PORT || 4999;

cron.schedule(
  "0 1 * * *",
  async () => {
    //sync products at 1:00
    await syncProducts();
  },
  {
    scheduled: true,
    timezone: "Australia/Sydney",
  }
);

cron.schedule(
  "0 2 * * *",
  async () => {
    //sync products at 2:00
    await syncTongtoolProducts();
  },
  {
    scheduled: true,
    timezone: "Australia/Sydney",
  }
);

cron.schedule(
  "0 4 * * *",
  async () => {
    //sync products at 4:00
    await syncCustomers(getDaysAgo(3), getNow());
  },
  {
    scheduled: true,
    timezone: "Australia/Sydney",
  }
);

app.get("/", async (req, res) => {
  await syncCustomers(toTimestamp(new Date("2019-01-01").getTime()), getNow());
  res.send("ok");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
