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
exports.saveRmas = void 0;
const lodash_1 = require("lodash");
const db_1 = require("../../db");
const uuid_1 = require("uuid");
const saveRmas = (rmas) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b, _c, _d;
    let originRmas = yield db_1.RmaCollection.find({
        id: { $in: rmas.map((rma) => rma.id) },
    }).toArray();
    let originRmasDict = (0, lodash_1.keyBy)(originRmas, "id");
    let customers = yield db_1.CustomerCollection.find({
        prestaId: { $in: rmas.map((rma) => rma.customer_id) },
    }).toArray();
    let customersDict = (0, lodash_1.keyBy)(customers, "id");
    for (const rma of rmas) {
        let matchedRma = originRmasDict[rma.id];
        let matchedCustomer = customersDict[rma.customer_id];
        if (matchedRma) {
            yield db_1.RmaCollection.updateOne({ id: rma.id }, {
                $set: {
                    tracking_number: (_a = rma.tracking_number) !== null && _a !== void 0 ? _a : "",
                },
            });
        }
        else {
            yield db_1.RmaCollection.insertOne(Object.assign(Object.assign({}, rma), { token: (0, uuid_1.v4)(), id: rma.id, customer_id: (_b = matchedCustomer === null || matchedCustomer === void 0 ? void 0 : matchedCustomer.id) !== null && _b !== void 0 ? _b : null, created_at: rma.created_at, updated_at: rma.updated_at, customer_group: (_c = matchedCustomer === null || matchedCustomer === void 0 ? void 0 : matchedCustomer.group_name) !== null && _c !== void 0 ? _c : null, returnItems: [], items: rma.items.map((item) => (Object.assign(Object.assign({}, item), { qty: parseInt(item.qty) }))), tracking_number: (_d = rma.tracking_number) !== null && _d !== void 0 ? _d : "" }));
        }
    }
});
exports.saveRmas = saveRmas;
