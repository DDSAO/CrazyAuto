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
exports.syncRmas = void 0;
const utils_1 = require("../utils");
const syncRmas = (start, end, verbose) => __awaiter(void 0, void 0, void 0, function* () {
    let firstRequest = yield (0, utils_1.sendGetRequest)(`/buyback/list?page_no=1&page_size=50&&from=${start}&to=${end}`);
    if (firstRequest === null || firstRequest === void 0 ? void 0 : firstRequest.total) {
        let { total } = firstRequest;
        for (let i = 0; i < Math.ceil(total / 50); i++) {
            let res = yield (0, utils_1.sendGetRequest)(`/buyback/list?page_no=${i + 1}&page_size=50&&from=${start}&to=${end}`);
            // await saveRmas(res.rmas);
            if (verbose)
                console.log((0, utils_1.timestampToDateTimeStr)((0, utils_1.getNow)()), "=>", "sync buyback", "pageNo", i + 1, "quantity", res.rmas.length);
        }
    }
    return [];
});
exports.syncRmas = syncRmas;
