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
exports.syncTongtoolProducts = void 0;
const axios_1 = __importDefault(require("axios"));
const utils_1 = require("../utils");
const db_1 = require("../../db");
const _saveTongtoolProducts_1 = require("./_saveTongtoolProducts");
const syncTongtoolProducts = (verbose) => __awaiter(void 0, void 0, void 0, function* () {
    for (const productType of [0, 1, 3]) {
        yield db_1.TongtoolProductCollection.deleteMany({ productType });
        let shouldContinue = true;
        let pageNo = 1;
        let errorCounts = 0;
        while (shouldContinue) {
            let startTs = (0, utils_1.getNow)();
            try {
                let response = yield axios_1.default.post(`${process.env.TONGTOOL_DOMAIN}/api-service/openapi/tongtool/goodsQuery${(0, utils_1.getTongtoolAppendix)()}`, {
                    merchantId: process.env.TONGTOOL_MERCHANT_ID,
                    pageSize: "100",
                    productType,
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
                let rawProducts = response.data.datas.array;
                if (verbose)
                    console.log((0, utils_1.timestampToDateTimeStr)((0, utils_1.getNow)()), "=>", "tongtool product", "productType", productType, "pageNo", pageNo, "quantity", rawProducts.length);
                yield (0, _saveTongtoolProducts_1.saveTongtoolProducts)(productType, rawProducts);
                if (rawProducts.length < 100) {
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
    }
});
exports.syncTongtoolProducts = syncTongtoolProducts;
