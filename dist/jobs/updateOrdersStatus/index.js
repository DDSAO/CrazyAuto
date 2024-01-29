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
exports.updateOrderStatusByIds = void 0;
const lodash_1 = require("lodash");
const db_1 = require("../../db");
const order_1 = require("../../interfaces/order");
const utils_1 = require("../utils");
const _getOrderStatusByIds_1 = require("./_getOrderStatusByIds");
const updateOrderStatusByIds = (verbose) => __awaiter(void 0, void 0, void 0, function* () {
    let notSettledOrders = yield db_1.OrderCollection.aggregate([
        {
            $match: {
                order_date: {
                    $gte: (0, utils_1.getNow)() - 86400 * 21,
                },
                status: {
                    $nin: order_1.COMPLETED_ORDER_STATUS,
                },
            },
        },
        {
            $project: {
                id: 1,
                status: 1,
            },
        },
    ]).toArray();
    if (verbose)
        console.log((0, utils_1.timestampToDateTimeStr)((0, utils_1.getNow)()), "=>", "unsettle orders", notSettledOrders.length);
    for (let i = 0; i < Math.ceil(notSettledOrders.length / 50); i++) {
        let originOrders = notSettledOrders.slice(i * 50, (i + 1) * 50);
        let response = yield (0, _getOrderStatusByIds_1.getOrderStatusByIds)(originOrders.map((order) => order.id));
        let orders = response.rmas;
        let originOrdersDict = (0, lodash_1.keyBy)(originOrders, "id");
        for (const order of orders) {
            let origin = originOrdersDict[order.id];
            if (origin && order.status && origin.status !== order.status) {
                yield db_1.OrderCollection.updateOne({ id: order.id }, {
                    $set: {
                        status: order.status,
                        created_at: order.created_at,
                        updated_at: order.updated_at,
                        lastSyncAt: (0, utils_1.getNow)(),
                    },
                });
            }
        }
    }
});
exports.updateOrderStatusByIds = updateOrderStatusByIds;
