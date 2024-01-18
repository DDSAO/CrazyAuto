import { keyBy } from "lodash";
import {
  CustomerCollection,
  NextOrderCollection,
  ProductCollection,
} from "../../db";
import {
  getNow,
  getSeq,
  sendGetRequest,
  timestampToDateTimeStr,
  toTwoDecimals,
} from "../utils";
import { RawPrestaOrder } from "../../interfaces/order";

export const syncRmas = async (
  start: number,
  end: number,
  verbose?: boolean
) => {
  let firstRequest = await sendGetRequest(
    `/buyback/list?page_no=1&page_size=50&&from=${start}&to=${end}`
  );
  if (firstRequest?.total) {
    let { total } = firstRequest;

    for (let i = 0; i < Math.ceil(total / 50); i++) {
      let res = await sendGetRequest(
        `/buyback/list?page_no=${i + 1}&page_size=50&&from=${start}&to=${end}`
      );
      // await saveRmas(res.rmas);
      if (verbose)
        console.log(
          timestampToDateTimeStr(getNow()),
          "=>",
          "sync buyback",
          "pageNo",
          i + 1,
          "quantity",
          res.rmas.length
        );
    }
  }

  return [];
};
