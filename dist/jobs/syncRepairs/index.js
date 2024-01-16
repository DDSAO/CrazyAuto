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
exports.syncRepairs = void 0;
const db_1 = require("../../db");
const utils_1 = require("../utils");
const syncRepairs = (start, end) => __awaiter(void 0, void 0, void 0, function* () {
    let firstRequest = yield (0, utils_1.sendGetRequest)(`/repair/list?page_no=1&page_size=50&&from=${start}&to=${end}`);
    let data = [];
    if (firstRequest.total) {
        let { total } = firstRequest;
        data = firstRequest.items;
        for (let i = 0; i < Math.ceil(total / 50); i++) {
            let res = yield (0, utils_1.sendGetRequest)(`/repair/list?page_no=${i + 2}&page_size=50&&from=${start}&to=${end}`);
            data = data.concat(res.items);
        }
    }
    let existedJobs = yield db_1.RepairJobCollection;
    let parsedJobs = data.map((job) => {
        return Object.assign(Object.assign({}, job), { prestaId: parseInt(job.id) });
    });
    return [];
});
exports.syncRepairs = syncRepairs;
