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
exports.notifyPickup = void 0;
const db_1 = require("../../db");
const smsSender_1 = require("../smsSender");
const notifyPickup = (tongtoolOrder) => __awaiter(void 0, void 0, void 0, function* () {
    let customer = yield db_1.CustomerCollection.findOne({
        id: tongtoolOrder.buyerAccountId,
    });
    let text = `Order #${tongtoolOrder.salesRecordNumber} is ready for Pick Up ${tongtoolOrder.warehouseName === "澳洲悉尼仓库"
        ? "at Sydney Warehouse (19-21 Euston Street Rydalmere, NSW 2116)"
        : tongtoolOrder.warehouseName === "澳洲墨尔本仓库"
            ? "at Melbourne Warehouse (8 Expo Court Mount Waverly,VIC 3149)"
            : ""}. ${customer
        ? `Opt out SMS subscription: https://czpofficeapp.com/customer/unsubscribe/${customer.token}`
        : ""} `;
    if (tongtoolOrder.buyerPhone)
        yield (0, smsSender_1.sendSMS)({
            phone: tongtoolOrder.buyerPhone,
            text,
            customer_id: tongtoolOrder.buyerAccountId,
            type: "PICKUP_NOTIFICATION",
        });
});
exports.notifyPickup = notifyPickup;
