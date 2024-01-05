import express, { Request, Response } from "express";
import cron from "node-cron";
import { syncOrders } from "./jobs/syncOrders";
import { syncProducts } from "./jobs/syncProducts";
import { getNow, getTongtoolAppendix, sleep, toTimestamp } from "./jobs/utils";
import CryptoJS from "crypto-js";
import axios from "axios";
import { syncTongtoolProducts } from "./jobs/syncTongtoolProducts";
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

app.get("/", async (req, res) => {
  await syncProducts();
  res.send("ok");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
