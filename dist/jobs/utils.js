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
exports.getDaysAgo = exports.beijingTimeToTimestamp = exports.timestampToBeijingTime = exports.sleep = exports.getTongtoolAppendix = exports.toTwoDecimals = exports.getNow = exports.toTimestamp = exports.getSeq = exports.sendGetRequest = void 0;
const axios_1 = __importDefault(require("axios"));
const db_1 = require("../db");
const crypto_js_1 = __importDefault(require("crypto-js"));
const moment_timezone_1 = __importDefault(require("moment-timezone"));
const sendGetRequest = (url) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let response = yield axios_1.default.get(`${process.env.PRESTA_DOMAIN}/czpoffice${url}`, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${process.env.AUTH_TOKEN}`,
                "X-Auth": `${process.env.AUTH_TOKEN}`,
            },
        });
        if (response.status === 200)
            return response.data.data;
        return null;
    }
    catch (e) {
        console.log(e);
        return null;
    }
});
exports.sendGetRequest = sendGetRequest;
const getSeq = (type, defaultValue) => __awaiter(void 0, void 0, void 0, function* () {
    let newSeq = yield db_1.SequenceCollection.findOne({ type });
    if (!newSeq) {
        yield db_1.SequenceCollection.insertOne({
            type,
            seq: defaultValue ? defaultValue + 1 : 2,
            updatedAt: (0, exports.getNow)(),
        });
        return defaultValue ? defaultValue : 1;
    }
    else {
        yield db_1.SequenceCollection.updateOne({
            type,
        }, {
            $inc: {
                seq: 1,
            },
            $set: {
                updatedAt: (0, exports.getNow)(),
            },
        });
        return newSeq.seq;
    }
});
exports.getSeq = getSeq;
const toTimestamp = (time) => Math.floor(time / 1000);
exports.toTimestamp = toTimestamp;
const getNow = () => (0, exports.toTimestamp)(new Date().getTime());
exports.getNow = getNow;
const toTwoDecimals = (num) => +(Math.round(num * 100) + "e-2");
exports.toTwoDecimals = toTwoDecimals;
const getTongtoolAppendix = () => {
    let now = (0, exports.getNow)();
    let signRaw = `app_token${process.env.TONGTOOL_APP_TOKEN}timestamp${now}${process.env.TONGTOOL_APP_SECRET}`;
    let sign = crypto_js_1.default.MD5(signRaw).toString();
    return `?app_token=${process.env.TONGTOOL_APP_TOKEN}}&timestamp=${now}&sign=${sign}`;
};
exports.getTongtoolAppendix = getTongtoolAppendix;
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
exports.sleep = sleep;
const timestampToBeijingTime = (timestamp) => {
    return (0, moment_timezone_1.default)(timestamp * 1000)
        .tz("Asia/Shanghai")
        .format("YYYY-MM-DD HH:mm:ss");
};
exports.timestampToBeijingTime = timestampToBeijingTime;
const beijingTimeToTimestamp = (timeStr) => {
    return isNaN(moment_timezone_1.default.tz(timeStr, "Asia/Shanghai").tz("Australia/Sydney").unix())
        ? null
        : moment_timezone_1.default.tz(timeStr, "Asia/Shanghai").tz("Australia/Sydney").unix();
};
exports.beijingTimeToTimestamp = beijingTimeToTimestamp;
const getDaysAgo = (days, setHours) => {
    if (!setHours) {
        return (0, exports.toTimestamp)(new Date().setDate(new Date().getDate() - days));
    }
    else {
        let numberArr = setHours.split(",").map((i) => parseInt(i));
        return (0, exports.toTimestamp)(new Date(new Date().setDate(new Date().getDate() - days)).setHours(numberArr[0], numberArr[1], numberArr[2]));
    }
};
exports.getDaysAgo = getDaysAgo;
