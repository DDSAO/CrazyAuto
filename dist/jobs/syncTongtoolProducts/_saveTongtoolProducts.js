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
exports.saveTongtoolProducts = void 0;
const lodash_1 = require("lodash");
const db_1 = require("../../db");
const utils_1 = require("../utils");
const saveTongtoolProducts = (productType, products) => __awaiter(void 0, void 0, void 0, function* () {
    let parsedProducts = [];
    for (const product of products) {
        if (productType === 0 || productType === 1) {
            if (product.goodsDetail) {
                for (const good of product.goodsDetail) {
                    parsedProducts.push(Object.assign(Object.assign(Object.assign({}, product), good), { itemId: null, productType: productType }));
                }
            }
        }
        else if (productType === 3) {
            if (product.goodsDetail) {
                parsedProducts.push(Object.assign(Object.assign({}, product), { goodsSku: product.sku, goodsAveCost: (0, utils_1.toTwoDecimals)(product.goodsDetail.reduce((sum, detail) => sum + detail.goodsAveCost, 0)), goodsCurCost: (0, utils_1.toTwoDecimals)(product.goodsDetail.reduce((sum, detail) => sum + detail.goodsCurCost, 0)), goodsWeight: (0, utils_1.toTwoDecimals)(product.goodsDetail.reduce((sum, detail) => sum + detail.goodsWeight, 0)), productType: productType, itemId: null }));
            }
        }
    }
    let originProducts = yield db_1.ProductCollection.find({
        upc: {
            $in: parsedProducts.map((good) => good.goodsSku),
        },
    }, {
        projection: {
            id: 1,
            upc: 1,
            _id: 0,
        },
    }).toArray();
    let originProductsDict = (0, lodash_1.keyBy)(originProducts, "upc");
    parsedProducts = parsedProducts.map((parsedProduct) => {
        var _a;
        let matchedProduct = originProductsDict[parsedProduct.goodsSku];
        return Object.assign(Object.assign({}, parsedProduct), { itemId: (_a = matchedProduct === null || matchedProduct === void 0 ? void 0 : matchedProduct.id) !== null && _a !== void 0 ? _a : null });
    });
    if (parsedProducts.length > 0)
        yield db_1.TongtoolProductCollection.insertMany([...parsedProducts]);
});
exports.saveTongtoolProducts = saveTongtoolProducts;
