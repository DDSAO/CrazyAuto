import { getNow, sendGetRequest, timestampToDateTimeStr } from "../utils";
import { saveCustomers } from "./_saveCustomers";

export const syncCustomers = async (
  start: number,
  end: number,
  verbose?: boolean
) => {
  let firstRequest = await sendGetRequest(
    `/customer/list?page_no=1&page_size=50&&from_update_time=${start}&to_update_time=${end}`
  );
  let data = [];
  if (firstRequest.total) {
    let { total } = firstRequest;
    data = firstRequest.customers;
    for (let i = 0; i < Math.ceil(total / 50); i++) {
      console.log(i, Math.ceil(total / 50));
      let res = await sendGetRequest(
        `/customer/list?page_no=${
          i + 1
        }&page_size=50&&from_update_time=${start}&to_update_time=${end}`
      );
      await saveCustomers(res.customers);
      if (verbose)
        console.log(
          timestampToDateTimeStr(getNow()),
          "=>",
          "sync customers",
          "pageNo",
          i + 1,
          "quantity",
          res.customers.length
        );
    }
  }

  return [];
};
