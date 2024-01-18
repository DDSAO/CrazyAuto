import express, { Request, Response } from "express";
import { CronJob } from "cron";
import { syncOrders } from "./jobs/syncOrders";
import { syncProducts } from "./jobs/syncProducts";
import {
  getDaysAgo,
  getNow,
  getTongtoolAppendix,
  sleep,
  timestampToDateTimeStr,
  toTimestamp,
} from "./jobs/utils";
import CryptoJS from "crypto-js";
import axios from "axios";
import { syncTongtoolProducts } from "./jobs/syncTongtoolProducts";
import { syncCustomers } from "./jobs/syncCustomers";
import { syncTongtoolOrders } from "./jobs/syncTongtoolOrders";
import { updateOrderStatusByIds } from "./jobs/updateOrdersStatus";
import { syncRmas } from "./jobs/syncRmas";

const app = express();
const port = process.env.PORT || 4999;
const VERBOSE = true;

new CronJob(
  "0 0 1 * * *",
  async () => {
    await syncProducts(VERBOSE);
  },
  () => {
    if (VERBOSE)
      console.log(timestampToDateTimeStr(getNow()), "sync products completed");
  },
  true,
  "Australia/Sydney"
);

new CronJob(
  "0 0 2 * * *",
  async () => {
    await syncTongtoolProducts(VERBOSE);
  },
  () => {
    if (VERBOSE)
      console.log(
        timestampToDateTimeStr(getNow()),
        "sync tongtool products completed"
      );
  },
  true,
  "Australia/Sydney"
);

new CronJob(
  "0 0 4 * * *",
  async () => {
    await syncCustomers(getDaysAgo(3), getNow(), VERBOSE);
  },
  () => {
    if (VERBOSE)
      console.log(timestampToDateTimeStr(getNow()), "sync customers completed");
  },
  true,
  "Australia/Sydney"
);

new CronJob(
  "0 * * * * *",
  async () => {
    await syncOrders(getNow() - 200, getNow(), VERBOSE);
  },
  () => {
    if (VERBOSE)
      console.log(
        timestampToDateTimeStr(getNow()),
        "sync recent orders completed"
      );
  },
  true,
  "Australia/Sydney"
);

// new CronJob(
//   "5 * * * * *",
//   async () => {
//     await syncTongtoolOrders(getNow() - 65, getNow(), VERBOSE);
//   },
//   () => {
//     if (VERBOSE)
//       console.log(
//         timestampToDateTimeStr(getNow()),
//         "sync recent tongtool orders completed"
//       );
//   },
//   true,
//   "Australia/Sydney"
// );

// new CronJob(
//   "5 0 * * * *",
//   async () => {
//     await syncTongtoolOrders(getNow() - 3605, getNow(), VERBOSE);
//   },
//   () => {
//     if (VERBOSE)
//       console.log(
//         timestampToDateTimeStr(getNow()),
//         "sync recent tongtool orders completed"
//       );
//   },
//   true,
//   "Australia/Sydney"
// );

new CronJob(
  "0 0 */1 * * *",
  async () => {
    await updateOrderStatusByIds(VERBOSE);
  },
  () => {
    if (VERBOSE)
      console.log(
        timestampToDateTimeStr(getNow()),
        "sync recent orders status completed"
      );
  },
  true,
  "Australia/Sydney"
);

new CronJob(
  "30 0 */1 * * *",
  async () => {
    await syncRmas(getNow() - 3605, getNow(), VERBOSE);
  },
  () => {
    if (VERBOSE)
      console.log(
        timestampToDateTimeStr(getNow()),
        "sync recent rmas completed"
      );
  },
  true,
  "Australia/Sydney"
);

app.get("/", async (req, res) => {
  await syncRmas(1532000714, 1852415960, VERBOSE);
  res.send("ok");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
