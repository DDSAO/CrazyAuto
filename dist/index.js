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
const cron_1 = require("cron");
const express_1 = __importDefault(require("express"));
const syncCustomers_1 = require("./jobs/syncCustomers");
const syncOrders_1 = require("./jobs/syncOrders");
const syncProducts_1 = require("./jobs/syncProducts");
const syncRmas_1 = require("./jobs/syncRmas");
const syncTongtoolProducts_1 = require("./jobs/syncTongtoolProducts");
const updateOrdersStatus_1 = require("./jobs/updateOrdersStatus");
const utils_1 = require("./jobs/utils");
const syncTongtoolOrders_1 = require("./jobs/syncTongtoolOrders");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config({ path: ".env" });
const app = (0, express_1.default)();
const port = process.env.PORT || 4999;
const VERBOSE = true;
new cron_1.CronJob("0 0 1 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, syncProducts_1.syncProducts)(VERBOSE);
}), () => {
    if (VERBOSE)
        console.log((0, utils_1.timestampToDateTimeStr)((0, utils_1.getNow)()), "sync products completed");
}, true, "Australia/Sydney");
new cron_1.CronJob("0 0 2 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, syncTongtoolProducts_1.syncTongtoolProducts)(VERBOSE);
}), () => {
    if (VERBOSE)
        console.log((0, utils_1.timestampToDateTimeStr)((0, utils_1.getNow)()), "sync tongtool products completed");
}, true, "Australia/Sydney");
new cron_1.CronJob("0 0 4 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, syncCustomers_1.syncCustomers)((0, utils_1.getDaysAgo)(3), (0, utils_1.getNow)(), VERBOSE);
}), () => {
    if (VERBOSE)
        console.log((0, utils_1.timestampToDateTimeStr)((0, utils_1.getNow)()), "sync customers completed");
}, true, "Australia/Sydney");
new cron_1.CronJob("0 * * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, syncOrders_1.syncOrders)((0, utils_1.getNow)() - 200, (0, utils_1.getNow)(), VERBOSE);
}), () => {
    if (VERBOSE)
        console.log((0, utils_1.timestampToDateTimeStr)((0, utils_1.getNow)()), "sync recent orders completed");
}, true, "Australia/Sydney");
new cron_1.CronJob("5 * * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, syncTongtoolOrders_1.syncTongtoolOrders)((0, utils_1.getNow)() - 65, (0, utils_1.getNow)(), VERBOSE);
}), () => {
    if (VERBOSE)
        console.log((0, utils_1.timestampToDateTimeStr)((0, utils_1.getNow)()), "sync recent tongtool orders completed");
}, true, "Australia/Sydney");
new cron_1.CronJob("5 0 * * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, syncTongtoolOrders_1.syncTongtoolOrders)((0, utils_1.getNow)() - 3605, (0, utils_1.getNow)(), VERBOSE);
}), () => {
    if (VERBOSE)
        console.log((0, utils_1.timestampToDateTimeStr)((0, utils_1.getNow)()), "sync recent tongtool orders completed");
}, true, "Australia/Sydney");
new cron_1.CronJob("0 0 */1 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, updateOrdersStatus_1.updateOrderStatusByIds)(VERBOSE);
}), () => {
    if (VERBOSE)
        console.log((0, utils_1.timestampToDateTimeStr)((0, utils_1.getNow)()), "sync recent orders status completed");
}, true, "Australia/Sydney");
new cron_1.CronJob("30 0 */1 * * *", () => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, syncRmas_1.syncRmas)((0, utils_1.getNow)() - 3605, (0, utils_1.getNow)(), VERBOSE);
}), () => {
    if (VERBOSE)
        console.log((0, utils_1.timestampToDateTimeStr)((0, utils_1.getNow)()), "sync recent rmas completed");
}, true, "Australia/Sydney");
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, syncRmas_1.syncRmas)(1532000714, 1852415960, VERBOSE);
    res.send("ok");
}));
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
