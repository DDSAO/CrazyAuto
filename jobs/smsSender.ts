import { CustomerCollection, SmSCollection } from "../db";
import { getNow, getSeq } from "./utils";

const client = require("twilio")(
  process.env.SENDGRID_SID,
  process.env.SENDGRID_TOKEN
);

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

  if (customer_id) {
    let customer = await CustomerCollection.findOne({ id: customer_id });
    if ((customer?.unsubscriptions ?? []).includes("*")) {
      await SmSCollection.insertOne({
        phone,
        parsedNumber,
        text,
        serialNumber,
        type,
        success: false,
        createdAt: getNow(),
        createdBy: "auto process",
        error: "MUTED",
        customer_id: customer_id ?? null,
      });
      return { serialNumber, success: false };
    }
  }

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
