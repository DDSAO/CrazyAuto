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

export const handleOos = async (tongtoolOrder: TongtoolOrder) => {
  let rows = await OrderRefundRowCollection.find({
    refundReason: "ASSIGN_STOCK_FAILED",
    order_id: tongtoolOrder.webstoreOrderId,
    item_id: {
      $in: tongtoolOrder.goodsInfo.tongToolGoodsInfoList.map(
        (order) => order.item_id
      ),
    },
  }).toArray();

  if (rows.length === 0) {
    let order = await OrderCollection.findOne({
      id: tongtoolOrder.webstoreOrderId,
    });
    let lines = order ? order.lines : [];
    let linesDict = keyBy(lines, "item_id");
    let failedItems = [];
    for (const item of tongtoolOrder.goodsInfo.tongToolGoodsInfoList) {
      let matchedLine = linesDict[item.item_id];

      if (matchedLine && item.quantity <= matchedLine.qty) {
        failedItems.push({
          sku: matchedLine?.sku ?? "",
          qty: item.quantity,
          amount: matchedLine
            ? toTwoDecimals(
                item.quantity *
                  (matchedLine.unit_price_exc_tax -
                    matchedLine.discount_amount / matchedLine.qty +
                    matchedLine.tax / matchedLine.qty)
              )
            : 0,
        });
        await OrderRefundRowCollection.insertOne({
          serialId: await getSeq("oos_item", 50000),
          customer_id: tongtoolOrder.buyerAccountId,
          order_id: tongtoolOrder.webstoreOrderId
            ? tongtoolOrder.webstoreOrderId
            : null,
          salesRecordNumber: tongtoolOrder.salesRecordNumber,
          item_id: matchedLine?.item_id,
          sku: matchedLine?.sku,
          upc: item.goodsSku,
          name: matchedLine?.name,
          maxQty: matchedLine?.qty,
          qty: item.quantity,
          unitPrice: matchedLine?.unit_price_exc_tax ?? 0,
          discount: matchedLine
            ? toTwoDecimals(matchedLine.discount_amount / matchedLine.qty)
            : 0,
          tax: matchedLine
            ? toTwoDecimals(matchedLine.tax / matchedLine.qty)
            : 0,
          amount: matchedLine
            ? toTwoDecimals(
                item.quantity *
                  (matchedLine.unit_price_exc_tax -
                    matchedLine.discount_amount / matchedLine.qty +
                    matchedLine.tax / matchedLine.qty)
              )
            : 0,
          refundReason: "ASSIGN_STOCK_FAILED",
          createdAt: getNow(),
          createdBy: "auto process",
        });
      } else {
        await OrderRefundRowCollection.insertOne({
          serialId: await getSeq("oos_item", 50000),
          customer_id: tongtoolOrder.buyerAccountId,
          order_id: tongtoolOrder.webstoreOrderId
            ? tongtoolOrder.webstoreOrderId
            : null,
          salesRecordNumber: tongtoolOrder.salesRecordNumber,
          item_id: matchedLine?.item_id,
          sku: matchedLine?.sku,
          upc: item.goodsSku,
          name: matchedLine?.name,
          maxQty: 0,
          qty: item.quantity,
          unitPrice: 0,
          discount: 0,
          tax: 0,
          amount: 0,
          refundReason: "ASSIGN_STOCK_FAILED",
          createdAt: getNow(),
          createdBy: "error",
        });
      }
    }
    if (failedItems.length > 0) {
      let text = `Order #${tongtoolOrder.salesRecordNumber} has ${Object.values(
        failedItems
      ).reduce(
        (sum, item) => sum + item.qty,
        0
      )} items waiting for refund due to unable to assign stocks: ${Object.values(
        failedItems
      )
        .map((row) => `${row.sku} * ${row.qty}`)
        .join(", ")}. Total Pending Payment: $ ${toTwoDecimals(
        Object.values(failedItems).reduce((sum, row) => sum + row.amount, 0)
      )}. [Updated at ${timestampToDateTimeStr(getNow())}]`;

      if (tongtoolOrder.buyerPhone)
        await sendSMS({
          phone: tongtoolOrder.buyerPhone,
          text,
          customer_id: tongtoolOrder.buyerAccountId,
          type: "ASSIGN_STOCK_FAILED_NOTIFICATION",
        });
    }
  }
};
