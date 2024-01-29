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
exports.saveProducts = void 0;
const lodash_1 = require("lodash");
const db_1 = require("../../db");
const _getClassname_1 = require("./_getClassname");
const utils_1 = require("../utils");
const saveProducts = (products) => __awaiter(void 0, void 0, void 0, function* () {
    let existedItems = yield db_1.ProductCollection.find({
        prestaId: {
            $in: products.map((product) => product.id),
        },
    }).toArray();
    let existedItemsDict = (0, lodash_1.keyBy)(existedItems, "prestaId");
    for (const product of products) {
        let matchedItem = existedItemsDict[product.id];
        let className = (0, _getClassname_1.getClassname)(product.product_kind, product.product_type);
        if (matchedItem) {
            yield db_1.ProductCollection.updateOne({
                id: matchedItem.id,
            }, {
                $set: {
                    name: product.name,
                    sku: product.sku,
                    product_kind: product.product_kind,
                    product_type: product.product_type,
                    created_at: product.created_at,
                    updated_at: product.updated_at,
                    class: className,
                    upc: product.upc ? String(product.upc).trim() : null,
                    quality: product.quality,
                    prices: {
                        Retailer: product.price,
                        Gold: product.group_price["4"].price,
                        Platinum: product.group_price["5"].price,
                        Diamond: product.group_price["6"].price,
                        Black: product.group_price["7"].price,
                    },
                },
            }, {
                upsert: true,
            });
        }
        else {
            let serialId = yield (0, utils_1.getSeq)("product", 50000);
            yield db_1.ProductCollection.insertOne(Object.assign(Object.assign({}, (0, lodash_1.omit)(product, ["czp_id"])), { id: serialId, prestaId: product.id ? product.id : null, magentoId: product.czp_id ? product.czp_id : null, name: product.name, sku: product.sku, product_kind: product.product_kind, product_type: product.product_type, created_at: product.created_at, updated_at: product.updated_at, class: className, upc: product.upc ? String(product.upc).trim() : null, quality: product.quality, prices: {
                    Retailer: product.price,
                    Gold: product.group_price["4"].price,
                    Platinum: product.group_price["5"].price,
                    Diamond: product.group_price["6"].price,
                    Black: product.group_price["7"].price,
                } }));
        }
    }
});
exports.saveProducts = saveProducts;
