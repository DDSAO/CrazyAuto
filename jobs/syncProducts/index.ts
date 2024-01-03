import { getNow, sendGetRequest } from "../utils";
import { _fetchProducts } from "./_fetchProducts";

export const syncProducts = async () => {
  let firstRequest = await sendGetRequest(
    `/product/list?page_no=1&page_size=50&&from=0&to=${getNow()}`
  );
  if (firstRequest.total) {
    let totalPages = Math.ceil(firstRequest.total / 50);
    let gap = Math.ceil(totalPages / 24);
    for (let i = 0; i < 24; i++) {
      console.log(i + 1, 24);
      try {
        await _fetchProducts(gap * i || 1, gap * (i + 1));
      } catch (e) {
        console.log(e);
      }
    }
  }
};
