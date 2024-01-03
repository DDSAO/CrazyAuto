import axios from "axios";
import { SequenceCollection } from "../db";
import CryptoJS from "crypto-js";

export const sendGetRequest = async (url: string) => {
  try {
    let response = await axios.get(
      `${process.env.API_DOMAIN}/czpoffice${url}`,
      {
        headers: {
          "Content-Type": "application/json",
          Authorization:
            "Basic NDU0ODFmZjk3Yzk5MWM1YjFhMTM3MmQ5N2E1OWVmZmY6Yjk2YmQ1NzktMzI3YS00N2Y0LWJkMTYtMTczOGI3NTlmYzZj",
          "X-Auth":
            "NDU0ODFmZjk3Yzk5MWM1YjFhMTM3MmQ5N2E1OWVmZmY6Yjk2YmQ1NzktMzI3YS00N2Y0LWJkMTYtMTczOGI3NTlmYzZj",
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

export const getTongtoolAppendix = () => {
  let now = getNow();
  let signRaw = `app_token${"a469bc177fefe2cb6d4874e6b7348513"}timestamp${now}${"7964478624a9488f818a640a4b2ef4bd19d570f495db47918a7e489a75866af0"}`;
  let sign = CryptoJS.MD5(signRaw).toString();
  return `?app_token=${"a469bc177fefe2cb6d4874e6b7348513"}&timestamp=${now}&sign=${sign}`;
};

export const sleep = (ms: number) =>
  new Promise((resolve) => setTimeout(resolve, ms));
