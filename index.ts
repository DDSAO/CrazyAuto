import dotenv from "dotenv";
import express from "express";
import { sendSMS } from "./jobs/smsSender";
import { getClient } from "./db/postgres";
import { saveCustomers } from "./jobs/magentoJobs/syncCustomers/_saveCustomers";
import { syncCustomers } from "./jobs/magentoJobs/syncCustomers";
import { getDaysAgo, getNow } from "./jobs/utils";
import { migrateCustomers } from "./scripts/buyback/_migrateCustomers";
import { migrateBuybacks } from "./scripts/buyback/_migrateBuybacks";
import { migratePhones } from "./scripts/phones/_migratePhones";
dotenv.config({ path: ".env" });

const app = express();
const port = process.env.PORT || 4999;
const VERBOSE = true;

// new CronJob(
//   "0 0 1 * * *",
//   async () => {
//     await syncProducts(VERBOSE);
//   },
//   () => {
//     if (VERBOSE)
//       console.log(timestampToDateTimeStr(getNow()), "sync products completed");
//   },
//   true,
//   "Australia/Sydney"
// );

// new CronJob(
//   "0 0 2 * * *",
//   async () => {
//     await syncTongtoolProducts(VERBOSE);
//   },
//   () => {
//     if (VERBOSE)
//       console.log(
//         timestampToDateTimeStr(getNow()),
//         "sync tongtool products completed"
//       );
//   },
//   true,
//   "Australia/Sydney"
// );

// new CronJob(
//   "0 0 4 * * *",
//   async () => {
//     await syncCustomers(getDaysAgo(3), getNow(), VERBOSE);
//   },
//   () => {
//     if (VERBOSE)
//       console.log(timestampToDateTimeStr(getNow()), "sync customers completed");
//   },
//   true,
//   "Australia/Sydney"
// );

// new CronJob(
//   "0 * * * * *",
//   async () => {
//     await syncOrders(getNow() - 200, getNow(), VERBOSE);
//   },
//   () => {
//     if (VERBOSE)
//       console.log(
//         timestampToDateTimeStr(getNow()),
//         "sync recent orders completed"
//       );
//   },
//   true,
//   "Australia/Sydney"
// );

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

// new CronJob(
//   "0 0 */1 * * *",
//   async () => {
//     await updateOrderStatusByIds(VERBOSE);
//   },
//   () => {
//     if (VERBOSE)
//       console.log(
//         timestampToDateTimeStr(getNow()),
//         "sync recent orders status completed"
//       );
//   },
//   true,
//   "Australia/Sydney"
// );

// new CronJob(
//   "30 0 */1 * * *",
//   async () => {
//     await syncRmas(getNow() - 3605, getNow(), VERBOSE);
//   },
//   () => {
//     if (VERBOSE)
//       console.log(
//         timestampToDateTimeStr(getNow()),
//         "sync recent rmas completed"
//       );
//   },
//   true,
//   "Australia/Sydney"
// );

// //temp mission
// new CronJob(
//   "0 49 11 * * *",
//   async () => {
//     await syncOrders(
//       toTimestamp(new Date("2024-02-01 20:00:00").getTime()),
//       getNow(),
//       VERBOSE
//     );
//     await syncTongtoolOrders(
//       toTimestamp(new Date("2024-02-01 20:00:00").getTime()),
//       getNow(),
//       VERBOSE
//     );
//   },
//   () => {
//     if (VERBOSE)
//       console.log(
//         timestampToDateTimeStr(getNow()),
//         "sync recent rmas completed"
//       );
//   },
//   true,
//   "Australia/Sydney"
// );

app.get("/", async (req, res) => {
  // await migrateCustomers();
  // await syncCustomers(0, getNow(), VERBOSE);
  // await migrateCustomers();
  await migratePhones();

  res.send("ok");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
