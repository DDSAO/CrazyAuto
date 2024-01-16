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
const lodash_1 = require("lodash");
const syncTongtoolProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    for (const productType of [0, 1, 3]) {
        yield db_1.TongtoolProductCollection.deleteMany({ productType });
        let shouldContinue = true;
        let pageNo = 1;
        while (shouldContinue) {
            let response = yield axios_1.default.post(`${process.env.TONGTOOL_DOMAIN}/api-service/openapi/tongtool/goodsQuery${(0, utils_1.getTongtoolAppendix)()}`, {
                merchantId: "867c7b0416daad473a756d6f0e21e6d7",
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
            yield (0, utils_1.sleep)(12000);
            if (response.data.datas !== null) {
                if (response.data.datas.array.length < 100) {
                    shouldContinue = false;
                }
                else {
                    pageNo += 1;
                }
            }
            let goods = [];
            for (const info of response.data.datas.array) {
                if (productType === 0 || productType === 1) {
                    if (info.goodsDetail) {
                        for (const good of info.goodsDetail) {
                            goods.push(Object.assign(Object.assign(Object.assign({}, info), good), { productType }));
                        }
                    }
                }
                else if (productType === 3) {
                    if (info.goodsDetail) {
                        goods.push(Object.assign(Object.assign({}, info), { goodsSku: info.sku, goodsAveCost: (0, utils_1.toTwoDecimals)(info.goodsDetail.reduce((sum, detail) => sum + detail.goodsAveCost, 0)), goodsCurCost: (0, utils_1.toTwoDecimals)(info.goodsDetail.reduce((sum, detail) => sum + detail.goodsCurCost, 0)), goodsWeight: (0, utils_1.toTwoDecimals)(info.goodsDetail.reduce((sum, detail) => sum + detail.goodsWeight, 0)), productType }));
                    }
                }
                else {
                    goods.push(Object.assign(Object.assign({}, info), { goodsSku: null, goodsAveCost: null, goodsCurCost: null, goodsWeight: null, productType }));
                }
            }
            let products = yield db_1.ProductCollection.find({
                upc: {
                    $in: goods.map((good) => good.goodsSku),
                },
            }, { projection: { id: 1, upc: 1, _id: 0 } }).toArray();
            let productsDict = (0, lodash_1.keyBy)(products, "upc");
            if (goods.length > 0) {
                yield db_1.TongtoolProductCollection.insertMany(goods.map((good) => {
                    return Object.assign(Object.assign({}, good), { itemId: good.goodsSku && productsDict[good.goodsSku]
                            ? productsDict[good.goodsSku].id
                            : null });
                }));
            }
        }
    }
});
exports.syncTongtoolProducts = syncTongtoolProducts;
