import { CronJob } from "cron";
import express from "express";
import { syncCustomers } from "./jobs/syncCustomers";
import { syncOrders } from "./jobs/syncOrders";
import { syncProducts } from "./jobs/syncProducts";
import { syncRmas } from "./jobs/syncRmas";
import { syncTongtoolProducts } from "./jobs/syncTongtoolProducts";
import { updateOrderStatusByIds } from "./jobs/updateOrdersStatus";
import { getDaysAgo, getNow, timestampToDateTimeStr } from "./jobs/utils";
import { syncTongtoolOrders } from "./jobs/syncTongtoolOrders";
import dotenv from "dotenv";
dotenv.config({ path: ".env" });

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

new CronJob(
  "5 * * * * *",
  async () => {
    await syncTongtoolOrders(getNow() - 65, getNow(), VERBOSE);
  },
  () => {
    if (VERBOSE)
      console.log(
        timestampToDateTimeStr(getNow()),
        "sync recent tongtool orders completed"
      );
  },
  true,
  "Australia/Sydney"
);

new CronJob(
  "5 0 * * * *",
  async () => {
    await syncTongtoolOrders(getNow() - 3605, getNow(), VERBOSE);
  },
  () => {
    if (VERBOSE)
      console.log(
        timestampToDateTimeStr(getNow()),
        "sync recent tongtool orders completed"
      );
  },
  true,
  "Australia/Sydney"
);

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
