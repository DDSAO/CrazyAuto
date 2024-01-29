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
exports.sendSMS = void 0;
const db_1 = require("../db");
const utils_1 = require("./utils");
const twilio_1 = require("twilio");
const sendSMS = (args) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const client = new twilio_1.Twilio(process.env.SENDGRID_SID, process.env.SENDGRID_TOKEN);
    const { phone, text, customer_id, type } = args;
    let parsedNumber = phone.replace(/\s/g, "");
    if (parsedNumber.startsWith("0") && parsedNumber.length === 10) {
        parsedNumber = "+61" + parsedNumber.slice(1);
    }
    else if (parsedNumber.length === 9) {
        parsedNumber = "+61" + parsedNumber;
    }
    let serialId = yield (0, utils_1.getSeq)("sms", 100000);
    let serialNumber = String(serialId).padStart(8, "0");
    if (customer_id) {
        let customer = yield db_1.CustomerCollection.findOne({ id: customer_id });
        if (((_a = customer === null || customer === void 0 ? void 0 : customer.unsubscriptions) !== null && _a !== void 0 ? _a : []).includes("*")) {
            yield db_1.SmSCollection.insertOne({
                phone,
                parsedNumber,
                text,
                serialNumber,
                type,
                success: false,
                createdAt: (0, utils_1.getNow)(),
                createdBy: "auto process",
                error: "MUTED",
                customer_id: customer_id !== null && customer_id !== void 0 ? customer_id : null,
            });
            return { serialNumber, success: false };
        }
    }
    try {
        let result = yield client.messages.create({
            body: text,
            from: "+61427654303",
            to: parsedNumber,
        });
        if (result.status === "queued") {
            yield db_1.SmSCollection.insertOne({
                phone,
                parsedNumber,
                text,
                serialNumber,
                type,
                success: true,
                createdAt: (0, utils_1.getNow)(),
                createdBy: "auto process",
                customer_id: customer_id !== null && customer_id !== void 0 ? customer_id : null,
            });
            return { serialNumber, success: true };
        }
        else {
            yield db_1.SmSCollection.insertOne({
                phone,
                parsedNumber,
                text,
                serialNumber,
                type,
                success: false,
                createdAt: (0, utils_1.getNow)(),
                createdBy: "auto process",
                error: "NOT QUEUED",
                customer_id: customer_id !== null && customer_id !== void 0 ? customer_id : null,
            });
            return { serialNumber, success: false };
        }
    }
    catch (e) {
        yield db_1.SmSCollection.insertOne({
            phone,
            parsedNumber,
            text,
            serialNumber,
            type,
            success: false,
            createdAt: (0, utils_1.getNow)(),
            createdBy: "auto process",
            error: e ? e.message : "",
            customer_id: customer_id !== null && customer_id !== void 0 ? customer_id : null,
        });
        return { serialNumber, success: false };
    }
});
exports.sendSMS = sendSMS;
