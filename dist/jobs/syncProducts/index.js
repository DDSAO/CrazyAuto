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
exports.syncProducts = void 0;
const utils_1 = require("../utils");
const _fetchProducts_1 = require("./_fetchProducts");
const syncProducts = () => __awaiter(void 0, void 0, void 0, function* () {
    let firstRequest = yield (0, utils_1.sendGetRequest)(`/product/list?page_no=1&page_size=50&&from=0&to=${(0, utils_1.getNow)()}`);
    if (firstRequest.total) {
        let totalPages = Math.ceil(firstRequest.total / 50);
        let gap = Math.ceil(totalPages / 24);
        for (let i = 0; i < 24; i++) {
            console.log(i + 1, 24);
            try {
                yield (0, _fetchProducts_1._fetchProducts)(gap * i || 1, gap * (i + 1));
            }
            catch (e) {
                console.log(e);
            }
        }
    }
});
exports.syncProducts = syncProducts;