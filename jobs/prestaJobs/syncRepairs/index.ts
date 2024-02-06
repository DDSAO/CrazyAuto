import { RepairJobCollection } from "../../../db";
import { RawRepairJob } from "../../../interfaces/repair";
import { sendGetRequest } from "../../utils";

export const syncRepairs = async (start: number, end: number) => {
  let firstRequest = await sendGetRequest(
    `/repair/list?page_no=1&page_size=50&&from=${start}&to=${end}`
  );
  let data: RawRepairJob[] = [];
  if (firstRequest.total) {
    let { total } = firstRequest;
    data = firstRequest.items;
    for (let i = 0; i < Math.ceil(total / 50); i++) {
      let res = await sendGetRequest(
        `/repair/list?page_no=${i + 2}&page_size=50&&from=${start}&to=${end}`
      );
      data = data.concat(res.items);
    }
  }

  let existedJobs = await RepairJobCollection;

  let parsedJobs = data.map((job) => {
    return {
      ...job,
      prestaId: parseInt(job.id),
    };
  });

  return [];
};
