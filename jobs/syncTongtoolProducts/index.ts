import axios from "axios";
import {
  getNow,
  getTongtoolAppendix,
  sleep,
  timestampToDateTimeStr,
  toTwoDecimals,
} from "../utils";
import { ProductCollection, TongtoolProductCollection } from "../../db";
import { keyBy, omit } from "lodash";
import { RawTongtoolProduct } from "../../interfaces/product";
import { saveTongtoolProducts } from "./_saveTongtoolProducts";

export const syncTongtoolProducts = async (verbose?: boolean) => {
  for (const productType of [0, 1, 3]) {
    await TongtoolProductCollection.deleteMany({ productType });
    let shouldContinue = true;
    let pageNo = 1;
    let errorCounts = 0;
    while (shouldContinue) {
      let startTs = getNow();
      try {
        let response = await axios.post(
          `${
            process.env.TONGTOOL_DOMAIN
          }/api-service/openapi/tongtool/goodsQuery${getTongtoolAppendix()}`,
          {
            merchantId: process.env.TONGTOOL_MERCHANT_ID,
            pageSize: "100",
            productType,
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
        let rawProducts: RawTongtoolProduct[] = response.data.datas.array;
        if (verbose)
          console.log(
            timestampToDateTimeStr(getNow()),
            "=>",
            "tongtool product",
            "productType",
            productType,
            "pageNo",
            pageNo,
            "quantity",
            rawProducts.length
          );

        await saveTongtoolProducts(productType, rawProducts);

        if (rawProducts.length < 100) {
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
  }
};
