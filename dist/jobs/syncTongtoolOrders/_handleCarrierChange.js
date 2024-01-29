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
exports.handleCarrierChange = void 0;
const db_1 = require("../../db");
const smsSender_1 = require("../smsSender");
const handleCarrierChange = (tongtoolOrder, originTongtoolOrder) => __awaiter(void 0, void 0, void 0, function* () {
    if (originTongtoolOrder) {
        //if this tongtool order is not oos, need to delete all unpaid ASSIGN_STOCK_FAILED records
        //in case that it was oos and waiting to give credits
        yield db_1.OrderRefundRowCollection.deleteMany({
            refundReason: "ASSIGN_STOCK_FAILED",
            salesRecordNumber: originTongtoolOrder.salesRecordNumber,
            paidAt: { $or: [{ $exsits: false }, null] },
        });
    }
    //if despatch type changed, notify customers
    let notifyContents = [];
    if (originTongtoolOrder &&
        originTongtoolOrder.dispathTypeName !== tongtoolOrder.dispathTypeName) {
        notifyContents.push(`Shipping Method Changed from [${originTongtoolOrder.dispathTypeName}] to [${tongtoolOrder.dispathTypeName}]`);
    }
    if (originTongtoolOrder &&
        originTongtoolOrder.packageInfoList &&
        originTongtoolOrder.packageInfoList[0] &&
        tongtoolOrder.packageInfoList &&
        tongtoolOrder.packageInfoList[0] &&
        originTongtoolOrder.packageInfoList[0].trackingNumber !==
            tongtoolOrder.packageInfoList[0].trackingNumber) {
        notifyContents.push(`Shipping Tracking Number Changed from [${originTongtoolOrder.packageInfoList[0].trackingNumber}] to [${tongtoolOrder.packageInfoList[0].trackingNumber}]`);
    }
    if (notifyContents.length > 0 && tongtoolOrder.buyerPhone) {
        yield (0, smsSender_1.sendSMS)({
            phone: tongtoolOrder.buyerPhone,
            text: `Order #${tongtoolOrder.salesRecordNumber} Shipping changed. ${notifyContents.join(", ")}`,
            customer_id: tongtoolOrder.buyerAccountId,
            type: "SHIPPING_CHANGED",
        });
    }
});
exports.handleCarrierChange = handleCarrierChange;
