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
exports._fetchProducts = void 0;
const db_1 = require("../../db");
const utils_1 = require("../utils");
const lodash_1 = require("lodash");
const _fetchProducts = (startPage, endPage) => __awaiter(void 0, void 0, void 0, function* () {
    let products = [];
    for (let i = startPage; i < endPage; i++) {
        try {
            let res = yield (0, utils_1.sendGetRequest)(`/product/list?page_no=${i}&page_size=50&&from=0&to=${(0, utils_1.getNow)()}`);
            products = products.concat(res.products);
        }
        catch (e) { }
    }
    let parsedProducts = products.map((product) => {
        let className = "unclassified";
        if (product.product_kind) {
            if (product.product_kind === "accessory") {
                className = "accessory";
            }
            else if (product.product_kind === "phone") {
                className = "phone";
            }
            else if (product.product_kind === "part") {
                className = "parts";
            }
            else if (product.product_kind === "Part") {
                className = "parts";
            }
            else {
                if (product.product_type === "Tools" ||
                    product.product_type === "Test Cables")
                    className = "unclassified";
            }
        }
        return Object.assign(Object.assign({}, (0, lodash_1.omit)(product, ["czp_id"])), { id: product.czp_id ? product.czp_id : 0, prestaId: product.id ? product.id : null, magentoId: product.czp_id ? product.czp_id : null, name: product.name, sku: product.sku, product_kind: product.product_kind, product_type: product.product_type, created_at: parseInt(product.created_at), updated_at: parseInt(product.updated_at), class: className, upc: product.upc ? String(product.upc).trim() : null, quality: product.quality, prices: {
                Retailer: null,
                Gold: null,
                Platinum: null,
                Diamond: null,
                Black: null,
            } });
    });
    let existedItems = yield db_1.ProductCollection.find({
        prestaId: {
            $in: parsedProducts
                .filter((product) => product.prestaId)
                .map((product) => product.prestaId),
        },
    }).toArray();
    let existedItemsDict = (0, lodash_1.keyBy)(existedItems, "prestaId");
    for (const parsedProduct of parsedProducts) {
        if (parsedProduct.id) {
            //items on both magento and presta
            yield db_1.ProductCollection.updateOne({
                id: parsedProduct.id,
            }, {
                $set: Object.assign({}, (0, lodash_1.omit)(parsedProduct, ["id", "prices"])),
            }, {
                upsert: true,
            });
        }
        else {
            //items only on presta
            if (parsedProduct.prestaId && existedItemsDict[parsedProduct.prestaId]) {
                //new items, but already saved, DONT reset id or prices
                yield db_1.ProductCollection.updateOne({
                    id: existedItemsDict[parsedProduct.prestaId].id,
                }, {
                    $set: Object.assign({}, (0, lodash_1.omit)(parsedProduct, ["id", "prices"])),
                }, {
                    upsert: true,
                });
            }
            else {
                //new items, never saved
                let serialId = yield (0, utils_1.getSeq)("product", 50000);
                yield db_1.ProductCollection.insertOne(Object.assign(Object.assign({}, (0, lodash_1.omit)(parsedProduct, ["id"])), { id: serialId }));
            }
        }
    }
    return [];
});
exports._fetchProducts = _fetchProducts;
