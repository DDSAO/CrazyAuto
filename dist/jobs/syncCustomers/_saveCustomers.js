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
exports.saveCustomers = void 0;
const lodash_1 = require("lodash");
const db_1 = require("../../db");
const utils_1 = require("../utils");
const uuid_1 = require("uuid");
const saveCustomers = (rawCustomers) => __awaiter(void 0, void 0, void 0, function* () {
    let existingCustomers = yield db_1.CustomerCollection.find({
        email: {
            $in: rawCustomers.map((customer) => customer.email),
        },
    }).toArray();
    let existingCustomersDict = (0, lodash_1.keyBy)(existingCustomers, "email");
    for (const rawCustomer of rawCustomers) {
        let matchedCustomer = existingCustomersDict[rawCustomer.email];
        if (matchedCustomer) {
            yield db_1.CustomerCollection.updateOne({
                id: matchedCustomer.id,
            }, {
                $set: {
                    firstname: rawCustomer.firstname,
                    lastname: rawCustomer.lastname,
                    email: rawCustomer.email,
                    phone: rawCustomer.phone,
                    group_id: rawCustomer.group_id,
                    group_name: rawCustomer.group_name,
                    account_manager_id: rawCustomer.account_manager_id,
                    account_manager_name: rawCustomer.account_manager_name,
                    lastSyncAt: (0, utils_1.getNow)(),
                    address: rawCustomer.address,
                    business_name: rawCustomer.business_name,
                    abn: rawCustomer.abn,
                    createdAt: rawCustomer.created_at,
                    prestaId: rawCustomer.id,
                },
            });
        }
        else {
            let serialId = yield (0, utils_1.getSeq)("customer", 30000);
            yield db_1.CustomerCollection.insertOne({
                id: serialId,
                token: (0, uuid_1.v4)(),
                firstname: rawCustomer.firstname,
                lastname: rawCustomer.lastname,
                email: rawCustomer.email,
                phone: rawCustomer.phone,
                group_id: rawCustomer.group_id,
                group_name: rawCustomer.group_name,
                account_manager_id: rawCustomer.account_manager_id,
                account_manager_name: rawCustomer.account_manager_name,
                lastSyncAt: (0, utils_1.getNow)(),
                address: rawCustomer.address,
                unsubscriptions: [],
                emails: [],
                business_name: rawCustomer.business_name,
                abn: rawCustomer.abn,
                createdAt: rawCustomer.created_at,
                prestaId: rawCustomer.id,
            });
        }
    }
});
exports.saveCustomers = saveCustomers;
