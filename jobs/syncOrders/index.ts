import { RawPrestaOrder } from "../../interfaces/order";
import { getNow, sendGetRequest, timestampToDateTimeStr } from "../utils";
import { saveOrders } from "./_saveOrders";

export const syncOrders = async (
  start: number,
  end: number,
  verbose?: boolean
) => {
  let firstRequest = await sendGetRequest(
    `/order/list?page_no=1&page_size=50&&from_update_time=${start}&to_update_time=${end}`
  );
  if (firstRequest?.total) {
    let { total } = firstRequest;
    for (let i = 0; i < Math.ceil(total / 50); i++) {
      let res = await sendGetRequest(
        `/order/list?page_no=${
          i + 1
        }&page_size=50&&from_update_time=${start}&to_update_time=${end}`
      );

      if (res) await saveOrders(res.orders);
      if (verbose)
        console.log(
          timestampToDateTimeStr(getNow()),
          "=>",
          "sync orders",
          "pageNo",
          i + 1,
          "quantity",
          res.orders.length
        );
    }
  }

  return [];
};
