import axios from "axios";
import {
  beijingTimeToTimestamp,
  getDaysAgo,
  getNow,
  getTongtoolAppendix,
  sleep,
  timestampToBeijingTime,
  toTimestamp,
  toTwoDecimals,
} from "../utils";
import { ProductCollection, TongtoolProductCollection } from "../../db";
import { keyBy, omit } from "lodash";
import {
  RawTongtoolOrder,
  TongtoolOrder,
} from "../../interfaces/tongtoolOrder";
import { saveTongtoolOrders } from "./_saveTongtoolOrders";
import { handleOos } from "./_handleOos";
import { notifyPickup } from "./_notifyPickup";
import { handleCarrierChange } from "./_handleCarrierChange";

export const syncTongtoolOrders = async (start: number, end: number) => {
  let shouldContinue = true;
  let pageNo = 1;
  let errorCounts = 0;

  while (shouldContinue) {
    try {
      let response = await axios.post(
        `https://open.tongtool.com/api-service/openapi/tongtool/ordersQuery${getTongtoolAppendix()}`,
        {
          merchantId: "867c7b0416daad473a756d6f0e21e6d7",
          storeFlag: "0",
          pageSize: "100",
          updatedDateFrom: timestampToBeijingTime(start),
          updatedDateTo: timestampToBeijingTime(end),
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
      let rawOrders: RawTongtoolOrder[] = response.data.datas.array;
      let parsedOrders = await saveTongtoolOrders(rawOrders);
      for (const order of parsedOrders) {
        if (order.dispathTypeName === "OOS") {
          //handle oos
          await handleOos(order);
        } else {
          //handle carrier or tracking changed
          await handleCarrierChange(order);
        }

        if (
          order.carrier === "Pick up at our store" &&
          order.despatchCompleteTimeTs &&
          order.despatchCompleteTimeTs >= getDaysAgo(7) &&
          (order.warehouseName === "澳洲悉尼仓库" ||
            order.warehouseName === "澳洲墨尔本仓库")
        ) {
          notifyPickup(order);
        }
      }

      if (rawOrders.length < 100) {
        shouldContinue = false;
      } else {
        pageNo++;
      }
    } catch (e) {
      console.log(e);
      if (errorCounts++ >= 20) break;
    }

    await sleep(12000);
  }
};
