import { keyBy } from "lodash";
import { TongtoolOrder } from "../../../interfaces/tongtoolOrder";
import {
  getNow,
  getSeq,
  timestampToDateTimeStr,
  toTwoDecimals,
} from "../../utils";
import { OrderCollection, OrderRefundRowCollection } from "../../../db";
import { sendSMS } from "../../smsSender";

export const handleCarrierChange = async (
  tongtoolOrder: TongtoolOrder,
  originTongtoolOrder?: TongtoolOrder | null
) => {
  if (originTongtoolOrder) {
    //if this tongtool order is not oos, need to delete all unpaid ASSIGN_STOCK_FAILED records
    //in case that it was oos and waiting to give credits
    await OrderRefundRowCollection.deleteMany({
      refundReason: "ASSIGN_STOCK_FAILED",
      salesRecordNumber: originTongtoolOrder.salesRecordNumber,
      paidAt: { $or: [{ $exsits: false }, null] },
    });
  }

  //if despatch type changed, notify customers
  let notifyContents = [];
  if (
    originTongtoolOrder &&
    originTongtoolOrder.dispathTypeName !== tongtoolOrder.dispathTypeName
  ) {
    notifyContents.push(
      `Shipping Method Changed from [${originTongtoolOrder.dispathTypeName}] to [${tongtoolOrder.dispathTypeName}]`
    );
  }
  if (
    originTongtoolOrder &&
    originTongtoolOrder.packageInfoList &&
    originTongtoolOrder.packageInfoList[0] &&
    tongtoolOrder.packageInfoList &&
    tongtoolOrder.packageInfoList[0] &&
    originTongtoolOrder.packageInfoList[0].trackingNumber !==
      tongtoolOrder.packageInfoList[0].trackingNumber
  ) {
    notifyContents.push(
      `Shipping Tracking Number Changed from [${originTongtoolOrder.packageInfoList[0].trackingNumber}] to [${tongtoolOrder.packageInfoList[0].trackingNumber}]`
    );
  }
  if (notifyContents.length > 0 && tongtoolOrder.buyerPhone) {
    await sendSMS({
      phone: tongtoolOrder.buyerPhone,
      text: `Order #${
        tongtoolOrder.salesRecordNumber
      } Shipping changed. ${notifyContents.join(", ")}`,
      customer_id: tongtoolOrder.buyerAccountId,
      type: "SHIPPING_CHANGED",
    });
  }
};
