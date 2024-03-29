import { getNow, sendGetRequest, timestampToDateTimeStr } from "../../utils";
import { saveRmas } from "./_saveRmas";

export const syncRmas = async (
  start: number,
  end: number,
  verbose?: boolean
) => {
  let firstRequest = await sendGetRequest(
    `/rma/list?page_no=1&page_size=50&&from=${start}&to=${end}`
  );
  if (firstRequest?.total) {
    let { total } = firstRequest;

    for (let i = 0; i < Math.ceil(total / 50); i++) {
      let res = await sendGetRequest(
        `/rma/list?page_no=${i + 1}&page_size=50&&from=${start}&to=${end}`
      );
      await saveRmas(res.rmas);
      if (verbose)
        console.log(
          timestampToDateTimeStr(getNow()),
          "=>",
          "sync rmas",
          "pageNo",
          i + 1,
          "quantity",
          res.rmas.length
        );
    }
  }

  return [];
};
