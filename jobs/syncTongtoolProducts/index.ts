import axios from "axios";
import { getTongtoolAppendix, sleep, toTwoDecimals } from "../utils";
import { ProductCollection, TongtoolProductCollection } from "../../db";
import { keyBy, omit } from "lodash";
import { RawTongtoolProduct } from "../../interfaces/product";
import { saveTongtoolProducts } from "./_saveTongtoolProducts";

export const syncTongtoolProducts = async () => {
  for (const productType of [0, 1, 3]) {
    await TongtoolProductCollection.deleteMany({ productType });
    let shouldContinue = true;
    let pageNo = 1;
    let errorCounts = 0;
    while (shouldContinue) {
      try {
        let response = await axios.post(
          `${
            process.env.TONGTOOL_DOMAIN
          }/api-service/openapi/tongtool/goodsQuery${getTongtoolAppendix()}`,
          {
            merchantId: "867c7b0416daad473a756d6f0e21e6d7",
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

        let rawProducts: RawTongtoolProduct[] = response.data.datas.array;
        await saveTongtoolProducts(productType, rawProducts);

        if (rawProducts.length < 100) {
          shouldContinue = false;
        } else {
          pageNo++;
        }
      } catch (e) {
        console.log(e);
        if (errorCounts >= 20) break;
      }

      await sleep(12000);
    }
  }
};
