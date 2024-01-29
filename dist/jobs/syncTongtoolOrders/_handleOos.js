"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleOos = void 0;
const lodash_1 = require("lodash");
const utils_1 = require("../utils");
const db_1 = require("../../db");
const smsSender_1 = require("../smsSender");
const handleOos = (tongtoolOrder) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let rows = yield db_1.OrderRefundRowCollection.find({
        refundReason: "ASSIGN_STOCK_FAILED",
        order_id: tongtoolOrder.webstoreOrderId,
        item_id: {
            $in: tongtoolOrder.goodsInfo.tongToolGoodsInfoList.map((order) => order.item_id),
        },
    }).toArray();
    if (rows.length === 0) {
        let order = yield db_1.OrderCollection.findOne({
            id: tongtoolOrder.webstoreOrderId,
        });
        let lines = order ? order.lines : [];
        let linesDict = (0, lodash_1.keyBy)(lines, "item_id");
        let failedItems = [];
        for (const item of tongtoolOrder.goodsInfo.tongToolGoodsInfoList) {
            let matchedLine = linesDict[item.item_id];
            if (matchedLine && item.quantity <= matchedLine.qty) {
                failedItems.push({
                    sku: (_a = matchedLine === null || matchedLine === void 0 ? void 0 : matchedLine.sku) !== null && _a !== void 0 ? _a : "",
                    qty: item.quantity,
                    amount: matchedLine
                        ? (0, utils_1.toTwoDecimals)(item.quantity *
                            (matchedLine.unit_price_exc_tax -
                                matchedLine.discount_amount / matchedLine.qty +
                                matchedLine.tax / matchedLine.qty))
                        : 0,
                });
                yield db_1.OrderRefundRowCollection.insertOne({
                    serialId: yield (0, utils_1.getSeq)("oos_item", 50000),
                    customer_id: tongtoolOrder.buyerAccountId,
                    order_id: tongtoolOrder.webstoreOrderId
                        ? tongtoolOrder.webstoreOrderId
                        : null,
                    salesRecordNumber: tongtoolOrder.salesRecordNumber,
                    item_id: matchedLine === null || matchedLine === void 0 ? void 0 : matchedLine.item_id,
                    sku: matchedLine === null || matchedLine === void 0 ? void 0 : matchedLine.sku,
                    upc: item.goodsSku,
                    name: matchedLine === null || matchedLine === void 0 ? void 0 : matchedLine.name,
                    maxQty: matchedLine === null || matchedLine === void 0 ? void 0 : matchedLine.qty,
                    qty: item.quantity,
                    unitPrice: (_b = matchedLine === null || matchedLine === void 0 ? void 0 : matchedLine.unit_price_exc_tax) !== null && _b !== void 0 ? _b : 0,
                    discount: matchedLine
                        ? (0, utils_1.toTwoDecimals)(matchedLine.discount_amount / matchedLine.qty)
                        : 0,
                    tax: matchedLine
                        ? (0, utils_1.toTwoDecimals)(matchedLine.tax / matchedLine.qty)
                        : 0,
                    amount: matchedLine
                        ? (0, utils_1.toTwoDecimals)(item.quantity *
                            (matchedLine.unit_price_exc_tax -
                                matchedLine.discount_amount / matchedLine.qty +
                                matchedLine.tax / matchedLine.qty))
                        : 0,
                    refundReason: "ASSIGN_STOCK_FAILED",
                    createdAt: (0, utils_1.getNow)(),
                    createdBy: "auto process",
                });
            }
            else {
                yield db_1.OrderRefundRowCollection.insertOne({
                    serialId: yield (0, utils_1.getSeq)("oos_item", 50000),
                    customer_id: tongtoolOrder.buyerAccountId,
                    order_id: tongtoolOrder.webstoreOrderId
                        ? tongtoolOrder.webstoreOrderId
                        : null,
                    salesRecordNumber: tongtoolOrder.salesRecordNumber,
                    item_id: matchedLine === null || matchedLine === void 0 ? void 0 : matchedLine.item_id,
                    sku: matchedLine === null || matchedLine === void 0 ? void 0 : matchedLine.sku,
                    upc: item.goodsSku,
                    name: matchedLine === null || matchedLine === void 0 ? void 0 : matchedLine.name,
                    maxQty: 0,
                    qty: item.quantity,
                    unitPrice: 0,
                    discount: 0,
                    tax: 0,
                    amount: 0,
                    refundReason: "ASSIGN_STOCK_FAILED",
                    createdAt: (0, utils_1.getNow)(),
                    createdBy: "error",
                });
            }
        }
        if (failedItems.length > 0) {
            let text = `Order #${tongtoolOrder.salesRecordNumber} has ${Object.values(failedItems).reduce((sum, item) => sum + item.qty, 0)} items waiting for refund due to unable to assign stocks: ${Object.values(failedItems)
                .map((row) => `${row.sku} * ${row.qty}`)
                .join(", ")}. Total Pending Payment: $ ${(0, utils_1.toTwoDecimals)(Object.values(failedItems).reduce((sum, row) => sum + row.amount, 0))}. [Updated at ${(0, utils_1.timestampToDateTimeStr)((0, utils_1.getNow)())}]`;
            if (tongtoolOrder.buyerPhone)
                yield (0, smsSender_1.sendSMS)({
                    phone: tongtoolOrder.buyerPhone,
                    text,
                    customer_id: tongtoolOrder.buyerAccountId,
                    type: "ASSIGN_STOCK_FAILED_NOTIFICATION",
                });
        }
    }
});
exports.handleOos = handleOos;
