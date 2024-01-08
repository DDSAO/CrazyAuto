import { keyBy } from "lodash";
import {
  CustomerCollection,
  NextOrderCollection,
  ProductCollection,
} from "../../db";
import { getNow, getSeq, sendGetRequest, toTwoDecimals } from "../utils";
import { RawPrestaOrder } from "../../interfaces/order";

export const syncBuybacks = async (start: number, end: number) => {
  let firstRequest = await sendGetRequest(
    `/customer/list?page_no=1&page_size=50&&from_update_time=${start}&to_update_time=${end}`
  );
  let data = [];
  if (firstRequest.total) {
    let { total } = firstRequest;
    data = firstRequest.buybacks;
    for (let i = 0; i < Math.ceil(total / 50); i++) {
      let res = await sendGetRequest(
        `/customer/list?page_no=${
          i + 2
        }&page_size=50&&from_update_time=${start}&to_update_time=${end}`
      );
      data = data.concat(res.buybacks);
    }
  }

  return [];
};
