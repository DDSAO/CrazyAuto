import axios from "axios";
import { SequenceCollection } from "../db";
import CryptoJS from "crypto-js";
import moment from "moment-timezone";

export const sendGetRequest = async (url: string) => {
  try {
    let response = await axios.get(
      `${process.env.PRESTA_DOMAIN}/czpoffice${url}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Basic ${process.env.AUTH_TOKEN}`,
          "X-Auth": `${process.env.AUTH_TOKEN}`,
        },
      }
    );
    if (response.status === 200) return response.data.data;
    return null;
  } catch (e) {
    console.log(e);
    return null;
  }
};

export const getSeq = async (type: string, defaultValue?: number) => {
  let newSeq = await SequenceCollection.findOne({ type });
  if (!newSeq) {
    await SequenceCollection.insertOne({
      type,
      seq: defaultValue ? defaultValue + 1 : 2,
      updatedAt: getNow(),
    });
    return defaultValue ? defaultValue : 1;
  } else {
    await SequenceCollection.updateOne(
      {
        type,
      },
      {
        $inc: {
          seq: 1,
        },
        $set: {
          updatedAt: getNow(),
        },
      }
    );
    return newSeq.seq;
  }
};

export const toTimestamp = (time: number) => Math.floor(time / 1000);

export const getNow = () => toTimestamp(new Date().getTime());

export const toTwoDecimals = (num: number) => +(Math.round(num * 100) + "e-2");

export const getTongtoolAppendix = () => {
  let now = getNow();
  let signRaw = `app_token${process.env.TONGTOOL_APP_TOKEN}timestamp${now}${process.env.TONGTOOL_APP_SECRET}`;
  let sign = CryptoJS.MD5(signRaw).toString();
  return `?app_token=${process.env.TONGTOOL_APP_TOKEN}}&timestamp=${now}&sign=${sign}`;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const timestampToBeijingTime = (timestamp: number) => {
  return moment(timestamp * 1000)
    .tz("Asia/Shanghai")
    .format("YYYY-MM-DD HH:mm:ss");
};

export const beijingTimeToTimestamp = (timeStr: string) => {
  return isNaN(
    moment.tz(timeStr, "Asia/Shanghai").tz("Australia/Sydney").unix()
  )
    ? null
    : moment.tz(timeStr, "Asia/Shanghai").tz("Australia/Sydney").unix();
};
