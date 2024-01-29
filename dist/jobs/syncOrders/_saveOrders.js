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
exports.saveOrders = void 0;
const lodash_1 = require("lodash");
const db_1 = require("../../db");
const utils_1 = require("../utils");
const saveOrders = (orders) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
    let productSet = new Set(), customerSet = new Set();
    for (const order of orders) {
        customerSet.add(order.customer_id);
        for (const line of order.lines) {
            productSet.add(line.item_id);
        }
    }
    let originNextOrders = yield db_1.NextOrderCollection.find({
        platform: "presta",
        platformId: {
            $in: orders.map((order) => order.id),
        },
    });
    let originNextOrdersDict = (0, lodash_1.keyBy)(originNextOrders, "id");
    let products = yield db_1.ProductCollection.find({
        prestaId: {
            $in: Array.from(productSet),
        },
    }).toArray();
    let productsDict = (0, lodash_1.keyBy)(products, "prestaId");
    let customers = yield db_1.CustomerCollection.find({
        prestaId: {
            $in: Array.from(customerSet),
        },
    }).toArray();
    let customersDict = (0, lodash_1.keyBy)(customers, "prestaId");
    //save in next order
    for (const order of orders) {
        let nextCustomer = customersDict[order.customer_id] || null;
        let originNextOrder = originNextOrdersDict[order.id];
        if (originNextOrder) {
            yield db_1.NextOrderCollection.updateOne({
                platform: "presta",
                platformId: order.id,
            }, {
                $set: {
                    status: order.status,
                    "customer.customerId": (nextCustomer === null || nextCustomer === void 0 ? void 0 : nextCustomer.id) || null,
                    items: order.lines.map((line) => {
                        var _a;
                        let product = productsDict[line.item_id];
                        return {
                            itemId: (product === null || product === void 0 ? void 0 : product.id) || null,
                            sku: line.sku,
                            upc: (_a = product === null || product === void 0 ? void 0 : product.upc) !== null && _a !== void 0 ? _a : "",
                            name: line.name,
                            unitPrice: line.unit_price_exc_tax,
                            qty: line.qty,
                            qtyRefunded: line.qty_refunded,
                            subtotal: (0, utils_1.toTwoDecimals)(line.unit_price_exc_tax * line.qty),
                            discountAmount: 0,
                            tax: line.tax,
                            total: line.row_total_inc_tax,
                            productKind: line.product_kind, //we can use default product_kind
                        };
                    }),
                    "timelines.updatedAt": (0, utils_1.getNow)(),
                    "timelines.updatedBy": "auto process",
                },
            });
        }
        else {
            let serialId = yield (0, utils_1.getSeq)("next_order", 1000);
            let paymentSerialId = yield (0, utils_1.getSeq)("next_payment");
            yield db_1.NextOrderCollection.insertOne({
                serialId,
                platform: "presta",
                platformId: order.id,
                status: order.status,
                customer: {
                    customerId: (nextCustomer === null || nextCustomer === void 0 ? void 0 : nextCustomer.id) || null,
                    firstName: order.customer_firstname,
                    lastName: order.customer_lastname,
                    level: order.customer_group,
                    phone: order.customer_phone,
                    email: order.customer_email,
                },
                shippingAddress: {
                    name: order.shipping_address.company,
                    phone: order.shipping_address.phone,
                    email: (nextCustomer === null || nextCustomer === void 0 ? void 0 : nextCustomer.email) || "",
                    addressLine1: order.shipping_address.address_line_1,
                    addressLine2: order.shipping_address.address_line_2,
                    city: order.shipping_address.city,
                    state: order.shipping_address.state,
                    postcode: order.shipping_address.postcode,
                    country: order.shipping_address.country,
                },
                items: order.lines.map((line) => {
                    var _a;
                    let product = productsDict[line.item_id];
                    return {
                        itemId: (product === null || product === void 0 ? void 0 : product.id) || null,
                        sku: line.sku,
                        upc: (_a = product === null || product === void 0 ? void 0 : product.upc) !== null && _a !== void 0 ? _a : "",
                        name: line.name,
                        unitPrice: line.unit_price_exc_tax,
                        qty: line.qty,
                        qtyRefunded: line.qty_refunded,
                        subtotal: (0, utils_1.toTwoDecimals)(line.unit_price_exc_tax * line.qty),
                        discountAmount: 0,
                        tax: line.tax,
                        total: line.row_total_inc_tax,
                        productKind: line.product_kind,
                    };
                }),
                payment: {
                    code: (_a = order.payment.method_code) !== null && _a !== void 0 ? _a : "",
                    name: (_b = order.payment.method_name) !== null && _b !== void 0 ? _b : "",
                },
                payments: [
                    {
                        serialId: paymentSerialId,
                        type: (_c = order.payment.method_code) !== null && _c !== void 0 ? _c : "presta_unknown",
                        amount: order.grand_total,
                        paidAt: order.created_at,
                        createdAt: order.created_at,
                        createdBy: "customer",
                    },
                ],
                shippingMethod: {
                    code: (_d = order.shipment.method_code) !== null && _d !== void 0 ? _d : "",
                    name: (_e = order.shipment.method_name) !== null && _e !== void 0 ? _e : "",
                    shipmentId: "-",
                },
                fees: {
                    subtotal: order.subtotal_exc_tax,
                    discount: 0,
                    tax: order.tax,
                    shippingFee: order.shipping,
                    insuranceFee: 0,
                    otherFee: 0,
                    total: (0, utils_1.toTwoDecimals)(order.subtotal_exc_tax + order.tax),
                },
                timelines: {
                    createdAt: order.created_at,
                    createdBy: "customer",
                    paidAt: order.created_at,
                    paidBy: "customer",
                    updatedAt: (0, utils_1.getNow)(),
                    updatedBy: "auto process",
                },
            });
        }
        yield db_1.OrderCollection.updateOne({
            id: order.id,
        }, {
            $set: Object.assign(Object.assign({}, order), { customer_id: (_f = nextCustomer === null || nextCustomer === void 0 ? void 0 : nextCustomer.id) !== null && _f !== void 0 ? _f : 0, shipment: {
                    method_code: (_g = order.shipment.method_code) !== null && _g !== void 0 ? _g : "",
                    method_name: (_h = order.shipment.method_name) !== null && _h !== void 0 ? _h : "",
                }, payment: {
                    method_code: (_j = order.payment.method_code) !== null && _j !== void 0 ? _j : "",
                    method_name: (_k = order.payment.method_name) !== null && _k !== void 0 ? _k : "",
                }, lines: order.lines.map((line) => {
                    var _a, _b, _c, _d, _e, _f, _g, _h;
                    return Object.assign(Object.assign({}, line), { id: (_a = productsDict[line.item_id]) === null || _a === void 0 ? void 0 : _a.id, upc: (_c = (_b = productsDict[line.item_id]) === null || _b === void 0 ? void 0 : _b.upc) !== null && _c !== void 0 ? _c : "", class: (_e = (_d = productsDict[line.item_id]) === null || _d === void 0 ? void 0 : _d.class) !== null && _e !== void 0 ? _e : "unclassified", product_kind: (_f = line.product_kind) !== null && _f !== void 0 ? _f : "", product_type: (_h = (_g = productsDict[line.item_id]) === null || _g === void 0 ? void 0 : _g.product_type) !== null && _h !== void 0 ? _h : "", discount_amount: 0 });
                }), order_date: order.order_date, created_at: order.created_at, updated_at: order.updated_at, lastSyncAt: (0, utils_1.getNow)(), geoCoding: {
                    lng: 0,
                    lat: 0,
                } }),
        }, { upsert: true });
    }
});
exports.saveOrders = saveOrders;
