import axios from "axios";
import { getTongtoolAppendix, sleep } from "../utils";

export const _fetchTongtoolProducts = async (productType: string) => {
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
    await sleep(12000);

    if (response.data.datas !== null) {
      if (response.data.datas.array.length < 100) {
        shouldContinue = false;
      } else {
        pageNo += 1;
      }
    }

    let goods = [];
    for (const info of response.data.datas.array) {
    }
  }
};
