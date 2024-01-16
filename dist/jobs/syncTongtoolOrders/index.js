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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.syncTongtoolOrders = void 0;
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../utils");
const syncTongtoolOrders = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c;
    let pageNo = 1;
    let shouldContinue = true;
    while (shouldContinue) {
        let response = yield axios_1.default.post(`https://open.tongtool.com/api-service/openapi/tongtool/ordersQuery${(0, utils_1.getTongtoolAppendix)()}`, {
            // accountCode: "",
            merchantId: "867c7b0416daad473a756d6f0e21e6d7",
            storeFlag: "0",
            pageSize: "100",
            updatedDateFrom: (0, utils_1.timestampToBeijingTime)((0, utils_1.getNow)() - 65),
            updatedDateTo: (0, utils_1.timestampToBeijingTime)((0, utils_1.getNow)()),
            pageNo,
        }, {
            headers: {
                "Content-Type": "application/json",
                api_version: "3.0",
            },
            timeout: 10000,
        });
        let infos = (_c = (_b = (_a = response.data) === null || _a === void 0 ? void 0 : _a.datas) === null || _b === void 0 ? void 0 : _b.array) !== null && _c !== void 0 ? _c : [];
        if (infos.length < 100) {
            shouldContinue = false;
        }
        for (const info of infos) {
            let newInfo = Object.assign(Object.assign({}, info), { buyerAccountId: parseInt(info.buyerAccountId), webstoreOrderId: parseInt(info.webstoreOrderId), shippingFeeIncome: (0, utils_1.toTwoDecimals)(info.shippingFeeIncome), platformFee: (0, utils_1.toTwoDecimals)(info.platformFee), webFinalFee: (0, utils_1.toTwoDecimals)(info.webFinalFee), actualTotalPrice: (0, utils_1.toTwoDecimals)(info.actualTotalPrice), taxIncome: (0, utils_1.toTwoDecimals)(info.taxIncome), productsTotalPrice: (0, utils_1.toTwoDecimals)(info.productsTotalPrice), orderAmount: (0, utils_1.toTwoDecimals)(info.orderAmount), saleTimeTs: info.saleTime
                    ? (0, utils_1.beijingTimeToTimestamp)(info.saleTime)
                    : null, paidTimeTs: info.paidTime
                    ? (0, utils_1.beijingTimeToTimestamp)(info.paidTime)
                    : null, assignstockCompleteTimeTs: info.assignstockCompleteTime
                    ? (0, utils_1.beijingTimeToTimestamp)(info.assignstockCompleteTime)
                    : null, printCompleteTimeTs: info.printCompleteTime
                    ? (0, utils_1.beijingTimeToTimestamp)(info.printCompleteTime)
                    : null, despatchCompleteTimeTs: info.despatchCompleteTime
                    ? (0, utils_1.beijingTimeToTimestamp)(info.despatchCompleteTime)
                    : null, packageInfoList: info.packageInfoList
                    ? info.packageInfoList.map((packageInfo) => {
                        return Object.assign(Object.assign({}, packageInfo), { trackingNumberTime: (0, utils_1.toTimestamp)(packageInfo.trackingNumberTime) });
                    })
                    : [], orderDetails: info.orderDetails
                    ? info.orderDetails.map((detail) => {
                        return Object.assign(Object.assign({}, detail), { item_id: !isNaN(parseInt(detail.webstore_item_id))
                                ? parseInt(detail.webstore_item_id)
                                : null, transaction_price: (0, utils_1.toTwoDecimals)(detail.transaction_price) });
                    })
                    : [], goodsInfo: {
                    platformGoodsInfoList: info.goodsInfo.platformGoodsInfoList.map((item) => {
                        return Object.assign(Object.assign({}, item), { item_id: !isNaN(parseInt(item.webstoreItemId))
                                ? parseInt(item.webstoreItemId)
                                : null });
                    }),
                    tongToolGoodsInfoList: info.goodsInfo.tongToolGoodsInfoList.map((item) => {
                        let matchedItem = info.goodsInfo.platformGoodsInfoList.find((platformGood) => platformGood.webTransactionId === item.wotId);
                        return Object.assign(Object.assign({}, item), { item_id: matchedItem
                                ? !isNaN(parseInt(matchedItem.webstoreItemId))
                                    ? parseInt(matchedItem.webstoreItemId)
                                    : null
                                : null });
                    }),
                } });
        }
        yield (0, utils_1.sleep)(12000);
    }
});
exports.syncTongtoolOrders = syncTongtoolOrders;
