import { SmSCollection } from "../db";
import { getNow, getSeq } from "./utils";

const accountSid = "AC2825137c360655e2ffa061a5fb714be1";
const authToken = "2d82fb1126082356a008a87e1ebc0c29";
const client = require("twilio")(accountSid, authToken);

export const sendSMS = async (args: {
  phone: string;
  text: string;
  type: string;
  customer_id?: number;
}) => {
  const { phone, text, customer_id, type } = args;

  let parsedNumber = phone.replace(/\s/g, "");

  if (parsedNumber.startsWith("0") && parsedNumber.length === 10) {
    parsedNumber = "+61" + parsedNumber.slice(1);
  } else if (parsedNumber.length === 9) {
    parsedNumber = "+61" + parsedNumber;
  }

  let serialId = await getSeq("sms", 100000);
  let serialNumber = String(serialId).padStart(8, "0");

  try {
    let result = await client.messages.create({
      body: text,
      from: "+61427654303",
      to: parsedNumber,
    });
    if (result.status === "queued") {
      await SmSCollection.insertOne({
        phone,
        parsedNumber,
        text,
        serialNumber,
        type,
        success: true,
        createdAt: getNow(),
        createdBy: "auto process",
        customer_id: customer_id ?? null,
      });
      return { serialNumber, success: true };
    } else {
      await SmSCollection.insertOne({
        phone,
        parsedNumber,
        text,
        serialNumber,
        type,
        success: false,
        createdAt: getNow(),
        createdBy: "auto process",
        error: "NOT QUEUED",
        customer_id: customer_id ?? null,
      });
      return { serialNumber, success: false };
    }
  } catch (e) {
    await SmSCollection.insertOne({
      phone,
      parsedNumber,
      text,
      serialNumber,
      type,
      success: false,
      createdAt: getNow(),
      createdBy: "auto process",
      error: e ? (e as any).message : "",
      customer_id: customer_id ?? null,
    });
    return { serialNumber, success: false };
  }
};
