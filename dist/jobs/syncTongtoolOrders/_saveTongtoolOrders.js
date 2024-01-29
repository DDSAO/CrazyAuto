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
exports.saveTongtoolOrders = void 0;
const lodash_1 = require("lodash");
const db_1 = require("../../db");
const utils_1 = require("../utils");
const saveTongtoolOrders = (orders) => __awaiter(void 0, void 0, void 0, function* () {
    let prestaOrders = orders.filter((order) => order.orderIdCode && order.orderIdCode.startsWith("CP"));
    let customers = yield db_1.CustomerCollection.find({
        prestaId: {
            $in: prestaOrders.map((order) => parseInt(order.buyerAccountId)),
        },
    }).toArray();
    let customersDict = (0, lodash_1.keyBy)(customers, "prestaId");
    let productsSet = new Set();
    for (const order of orders) {
        for (const row of order.orderDetails) {
            productsSet.add(parseInt(row.webstore_item_id));
        }
        for (const row of order.goodsInfo.platformGoodsInfoList) {
            productsSet.add(parseInt(row.webstoreItemId));
        }
    }
    let products = yield db_1.ProductCollection.find({
        prestaId: { $in: Array.from(productsSet) },
    }).toArray();
    let productsDict = (0, lodash_1.keyBy)(products, "prestaId");
    let originOrders = yield db_1.TongtoolOrderCollection.find({
        orderIdCode: orders.map((order) => order.orderIdCode),
    }).toArray();
    let originOrdersDict = (0, lodash_1.keyBy)(originOrders, "orderIdCode");
    let parsedOrders = prestaOrders.map((order) => {
        var _a;
        let matchedCustomer = customersDict[order.buyerAccountId];
        let platformGoodsInfoListDict = (0, lodash_1.keyBy)(order.goodsInfo.platformGoodsInfoList, "webTransactionId");
        return Object.assign(Object.assign({}, order), { buyerAccountId: (_a = matchedCustomer === null || matchedCustomer === void 0 ? void 0 : matchedCustomer.id) !== null && _a !== void 0 ? _a : null, webstoreOrderId: parseInt(order.webstoreOrderId), shippingFeeIncome: (0, utils_1.toTwoDecimals)(order.shippingFeeIncome), platformFee: (0, utils_1.toTwoDecimals)(order.platformFee), webFinalFee: (0, utils_1.toTwoDecimals)(order.webFinalFee), actualTotalPrice: (0, utils_1.toTwoDecimals)(order.actualTotalPrice), taxIncome: (0, utils_1.toTwoDecimals)(order.taxIncome), productsTotalPrice: (0, utils_1.toTwoDecimals)(order.productsTotalPrice), orderAmount: (0, utils_1.toTwoDecimals)(order.orderAmount), saleTimeTs: order.saleTime
                ? (0, utils_1.beijingTimeToTimestamp)(order.saleTime)
                : null, paidTimeTs: order.paidTime
                ? (0, utils_1.beijingTimeToTimestamp)(order.paidTime)
                : null, assignstockCompleteTimeTs: order.assignstockCompleteTime
                ? (0, utils_1.beijingTimeToTimestamp)(order.assignstockCompleteTime)
                : null, printCompleteTimeTs: order.printCompleteTime
                ? (0, utils_1.beijingTimeToTimestamp)(order.printCompleteTime)
                : null, despatchCompleteTimeTs: order.despatchCompleteTime
                ? (0, utils_1.beijingTimeToTimestamp)(order.despatchCompleteTime)
                : null, packageInfoList: order.packageInfoList, orderDetails: order.orderDetails
                ? order.orderDetails.map((detail) => {
                    var _a;
                    let matchedProduct = productsDict[detail.webstore_item_id];
                    return Object.assign(Object.assign({}, detail), { item_id: (_a = matchedProduct === null || matchedProduct === void 0 ? void 0 : matchedProduct.id) !== null && _a !== void 0 ? _a : null, transaction_price: (0, utils_1.toTwoDecimals)(detail.transaction_price) });
                })
                : [], goodsInfo: {
                platformGoodsInfoList: order.goodsInfo.platformGoodsInfoList.map((item) => {
                    var _a;
                    let matchedProduct = productsDict[item.webstoreItemId];
                    return Object.assign(Object.assign({}, item), { item_id: (_a = matchedProduct === null || matchedProduct === void 0 ? void 0 : matchedProduct.id) !== null && _a !== void 0 ? _a : null });
                }),
                tongToolGoodsInfoList: order.goodsInfo.tongToolGoodsInfoList.map((item) => {
                    var _a;
                    let matchedItem = platformGoodsInfoListDict[item.wotId];
                    let matchedProduct = productsDict[matchedItem.webstoreItemId];
                    return Object.assign(Object.assign({}, item), { item_id: (_a = matchedProduct === null || matchedProduct === void 0 ? void 0 : matchedProduct.id) !== null && _a !== void 0 ? _a : null });
                }),
            } });
    });
    for (const order of parsedOrders) {
        //save tongtool order
        yield db_1.TongtoolOrderCollection.updateOne({
            orderIdCode: order.orderIdCode,
        }, {
            $set: Object.assign({}, order),
        }, { upsert: true });
    }
    return parsedOrders;
});
exports.saveTongtoolOrders = saveTongtoolOrders;
