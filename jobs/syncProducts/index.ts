import { getNow, sendGetRequest, timestampToDateTimeStr } from "../utils";
import { saveProducts } from "./_saveProducts";

export const syncProducts = async (verbose?: boolean) => {
  let firstRequest = await sendGetRequest(
    `/product/list?page_no=1&page_size=50&&from=0&to=${getNow()}`
  );
  if (firstRequest.total) {
    let { total } = firstRequest;
    for (let i = 0; i < Math.ceil(total / 50); i++) {
      let res = await sendGetRequest(
        `/product/list?page_no=${i + 1}&page_size=50&&from=0&to=${getNow()}`
      );
      if (res) await saveProducts(res.products);
      if (verbose)
        console.log(
          timestampToDateTimeStr(getNow()),
          "=>",
          "sync products",
          "pageNo",
          i + 1,
          "quantity",
          res.products.length
        );
    }
  }
};
