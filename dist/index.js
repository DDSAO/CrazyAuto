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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const node_cron_1 = __importDefault(require("node-cron"));
const syncProducts_1 = require("./jobs/syncProducts");
const utils_1 = require("./jobs/utils");
const syncTongtoolProducts_1 = require("./jobs/syncTongtoolProducts");
const syncCustomers_1 = require("./jobs/syncCustomers");
const app = (0, express_1.default)();
const port = process.env.PORT || 4999;
node_cron_1.default.schedule("0 1 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    //sync products at 1:00
    yield (0, syncProducts_1.syncProducts)();
}), {
    scheduled: true,
    timezone: "Australia/Sydney",
});
node_cron_1.default.schedule("0 2 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    //sync products at 2:00
    yield (0, syncTongtoolProducts_1.syncTongtoolProducts)();
}), {
    scheduled: true,
    timezone: "Australia/Sydney",
});
node_cron_1.default.schedule("0 4 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    //sync products at 4:00
    yield (0, syncCustomers_1.syncCustomers)((0, utils_1.getDaysAgo)(3), (0, utils_1.getNow)());
}), {
    scheduled: true,
    timezone: "Australia/Sydney",
});
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, syncCustomers_1.syncCustomers)((0, utils_1.toTimestamp)(new Date("2019-01-01").getTime()), (0, utils_1.getNow)());
    res.send("ok");
}));
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
