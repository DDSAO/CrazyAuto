import axios from "axios";
import {
  beijingTimeToTimestamp,
  getDaysAgo,
  getNow,
  getTongtoolAppendix,
  sleep,
  timestampToBeijingTime,
  timestampToDateTimeStr,
  toTimestamp,
  toTwoDecimals,
} from "../../utils";
import { ProductCollection, TongtoolProductCollection } from "../../../db";
import { keyBy, omit } from "lodash";
import {
  RawTongtoolOrder,
  TongtoolOrder,
} from "../../../interfaces/tongtoolOrder";
import { saveTongtoolOrders } from "./_saveTongtoolOrders";
import { handleOos } from "./_handleOos";
import { notifyPickup } from "./_notifyPickup";
import { handleCarrierChange } from "./_handleCarrierChange";

export const syncTongtoolOrders = async (
  start: number,
  end: number,
  verbose?: boolean
) => {
  let shouldContinue = true;
  let pageNo = 1;
  let errorCounts = 0;

  while (shouldContinue) {
    let startTs = getNow();

    try {
      let response = await axios.post(
        `https://open.tongtool.com/api-service/openapi/tongtool/ordersQuery${getTongtoolAppendix()}`,
        {
          merchantId: process.env.TONGTOOL_MERCHANT_ID,
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

      if (!response.data.datas) throw new Error(response.data.message);
      let rawOrders: RawTongtoolOrder[] = response.data.datas?.array;

      if (verbose)
        console.log(
          timestampToDateTimeStr(getNow()),
          "=>",
          "tongtool orders",
          "pageNo",
          pageNo,
          "quantity",
          rawOrders.length
        );

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

    let now = getNow();
    if (now < startTs + 13) {
      await sleep((13 - (now - startTs)) * 1000);
    }
  }
};
