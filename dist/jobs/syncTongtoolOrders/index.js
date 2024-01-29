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
const _saveTongtoolOrders_1 = require("./_saveTongtoolOrders");
const _handleOos_1 = require("./_handleOos");
const _notifyPickup_1 = require("./_notifyPickup");
const _handleCarrierChange_1 = require("./_handleCarrierChange");
const syncTongtoolOrders = (start, end, verbose) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let shouldContinue = true;
    let pageNo = 1;
    let errorCounts = 0;
    while (shouldContinue) {
        let startTs = (0, utils_1.getNow)();
        try {
            let response = yield axios_1.default.post(`https://open.tongtool.com/api-service/openapi/tongtool/ordersQuery${(0, utils_1.getTongtoolAppendix)()}`, {
                merchantId: process.env.TONGTOOL_MERCHANT_ID,
                storeFlag: "0",
                pageSize: "100",
                updatedDateFrom: (0, utils_1.timestampToBeijingTime)(start),
                updatedDateTo: (0, utils_1.timestampToBeijingTime)(end),
                pageNo,
            }, {
                headers: {
                    "Content-Type": "application/json",
                    api_version: "3.0",
                },
                timeout: 10000,
            });
            if (!response.data.datas)
                throw new Error(response.data.message);
            let rawOrders = (_a = response.data.datas) === null || _a === void 0 ? void 0 : _a.array;
            if (verbose)
                console.log((0, utils_1.timestampToDateTimeStr)((0, utils_1.getNow)()), "=>", "tongtool orders", "pageNo", pageNo, "quantity", rawOrders.length);
            let parsedOrders = yield (0, _saveTongtoolOrders_1.saveTongtoolOrders)(rawOrders);
            for (const order of parsedOrders) {
                if (order.dispathTypeName === "OOS") {
                    //handle oos
                    yield (0, _handleOos_1.handleOos)(order);
                }
                else {
                    //handle carrier or tracking changed
                    yield (0, _handleCarrierChange_1.handleCarrierChange)(order);
                }
                if (order.carrier === "Pick up at our store" &&
                    order.despatchCompleteTimeTs &&
                    order.despatchCompleteTimeTs >= (0, utils_1.getDaysAgo)(7) &&
                    (order.warehouseName === "澳洲悉尼仓库" ||
                        order.warehouseName === "澳洲墨尔本仓库")) {
                    (0, _notifyPickup_1.notifyPickup)(order);
                }
            }
            if (rawOrders.length < 100) {
                shouldContinue = false;
            }
            else {
                pageNo++;
            }
        }
        catch (e) {
            console.log(e);
            if (errorCounts++ >= 20)
                break;
        }
        let now = (0, utils_1.getNow)();
        if (now < startTs + 13) {
            yield (0, utils_1.sleep)((13 - (now - startTs)) * 1000);
        }
    }
});
exports.syncTongtoolOrders = syncTongtoolOrders;
