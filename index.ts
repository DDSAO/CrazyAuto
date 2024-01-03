import express, { Request, Response } from "express";
import cron from "node-cron";
import { syncOrders } from "./jobs/syncOrders";
import { syncProducts } from "./jobs/syncProducts";
import { getNow, getTongtoolAppendix, sleep } from "./jobs/utils";
import CryptoJS from "crypto-js";
import axios from "axios";
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

app.get("/", async (req, res) => {
  let shouldContinue = true;
  let pageNo = 1;
  while (shouldContinue) {
    let response = await axios.post(
      `https://open.tongtool.com/api-service/openapi/tongtool/goodsQuery${getTongtoolAppendix()}`,
      {
        merchantId: "867c7b0416daad473a756d6f0e21e6d7",
        pageSize: "100",
        productType: "0",
        pageNo,
      },
      {
        headers: {
          "Content-Type": "application/json",
          api_version: "3.0",
        },
        timeout: 10000,
      }
    );
    if (response.data.datas !== null) {
      console.log(response.data.datas);
      if (response.data.datas.length === 0) {
        break;
      } else {
        pageNo += 1;
      }
    }

    await sleep(12000);
  }

  res.send("ok");
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
