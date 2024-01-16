"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// export const _handleOos = async (info:TongtoolOrder) => {
//     let platformGoodDict = keyBy(info.goodsInfo.platformGoodsInfoList,"webTransactionId")
//     let rows = await OrderRefundRowCollection.find({
//       refundReason: "ASSIGN_STOCK_FAILED",
//       order_id: info.webstoreOrderId,
//       item_id: { $in: Object.keys(platformGoodDict).map((key) => parseInt(key)) },
//     }).toArray();
//     if (rows.length === 0) {
//       let order = await OrderCollection.findOne({
//         order_id: info.webstoreOrderId,
//       });
//       let lines = order ? order.lines : [];
//       let failedItems = [];
//       for (const item of info.goodsInfo.tongToolGoodsInfoList) {
//         let matchedProductId = platformGoodDict[item.wotId]?.webstoreItemId ?? null;
//         let matchedLine = lines.find(
//           (line) => line.item_id === matchedProductId
//         );
//         if (matchedLine && item.quantity <= matchedLine.qty) {
//           failedItems.push({
//             sku: matchedLine?.sku ?? "",
//             qty: item.quantity,
//             amount: matchedLine
//               ? toTwoDecimals(
//                   item.quantity *
//                     (matchedLine.unit_price_exc_tax -
//                       matchedLine.discount_amount / matchedLine.qty +
//                       matchedLine.tax / matchedLine.qty)
//                 )
//               : 0,
//           });
//           await OrderRefundRowCollection.insertOne({
//             serialId: await getSeq("oos_item",50000),
//             customer_id: info.buyerAccountId,
//             order_id: info.webstoreOrderId
//               ? info.webstoreOrderId
//               : null,
//             salesRecordNumber: info.salesRecordNumber,
//             item_id: matchedLine?.item_id,
//             sku: matchedLine?.sku,
//             upc: item.goodsSku,
//             name: matchedLine?.name,
//             maxQty: matchedLine?.qty,
//             qty: item.quantity,
//             unitPrice: matchedLine?.unit_price_exc_tax ?? 0,
//             discount: matchedLine
//               ? toTwoDecimals(matchedLine.discount_amount / matchedLine.qty)
//               : 0,
//             tax: matchedLine
//               ? toTwoDecimals(matchedLine.tax / matchedLine.qty)
//               : 0,
//             amount: matchedLine
//               ? toTwoDecimals(
//                   item.quantity *
//                     (matchedLine.unit_price_exc_tax -
//                       matchedLine.discount_amount / matchedLine.qty +
//                       matchedLine.tax / matchedLine.qty)
//                 )
//               : 0,
//             refundReason: "ASSIGN_STOCK_FAILED",
//             createdAt: getNow(),
//             createdBy: "auto process",
//           });
//         } else {
//           await OrderRefundRowCollection.insertOne({
//             serialId: await getSerialId("oos_item"),
//             customer_id: info.buyerAccountId,
//             order_id: info.webstoreOrderId
//               ? info.webstoreOrderId
//               : null,
//             salesRecordNumber: info.salesRecordNumber,
//             item_id: matchedLine?.item_id,
//             sku: matchedLine?.sku,
//             upc: item.goodsSku,
//             name: matchedLine?.name,
//             qty: item.quantity,
//             unitPrice: 0,
//             discount: 0,
//             tax: 0,
//             amount: 0,
//             refundReason: "ASSIGN_STOCK_FAILED",
//             createdAt: getNow(),
//             createdBy: "error",
//           });
//         }
//       }
//       if (failedItems.length > 0) {
//         let text = `Order #${info.salesRecordNumber} has ${Object.values(
//           failedItems
//         ).reduce(
//           (sum, item) => sum + item.qty,
//           0
//         )} items waiting for refund due to unable to assign stocks: ${Object.values(
//           failedItems
//         )
//           .map((row) => `${row.sku} * ${row.qty}`)
//           .join(", ")}. Total Pending Payment: $ ${toTwoDecimals(
//           Object.values(failedItems).reduce((sum, row) => sum + row.amount, 0)
//         )}. [Updated at ${timestampToDateTimeStr(getNow())}]`;
//         await sendSMS({
//           phone: info.buyerPhone,
//           text,
//           username: "auto process",
//           customer_id: info.buyerAccountId,
//           type: "ASSIGN_STOCK_FAILED_NOTIFICATION",
//         });
//       }
//     }
// };
