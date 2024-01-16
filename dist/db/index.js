"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RepairJobCollection = exports.CustomerCollection = exports.NextOrderCollection = exports.OrderRefundRowCollection = exports.TongtoolProductCollection = exports.SmSCollection = exports.SequenceCollection = exports.ProductCollection = exports.client = void 0;
const mongodb_1 = require("mongodb");
exports.client = new mongodb_1.MongoClient("mongodb://0.0.0.0:27017");
exports.ProductCollection = exports.client
    .db("CrazyApp")
    .collection("ProductCollection");
exports.SequenceCollection = exports.client
    .db("CrazyApp")
    .collection("SequenceCollection");
exports.SmSCollection = exports.client
    .db("CrazyApp")
    .collection("SmSCollection");
exports.TongtoolProductCollection = exports.client
    .db("CrazyApp")
    .collection("TongtoolProductCollection");
exports.OrderRefundRowCollection = exports.client
    .db("CrazyApp")
    .collection("OrderRefundRowCollection");
exports.NextOrderCollection = exports.client
    .db("CrazyApp")
    .collection("NextOrderCollection");
exports.CustomerCollection = exports.client
    .db("CrazyApp")
    .collection("CustomerCollection");
exports.RepairJobCollection = exports.client
    .db("CrazyApp")
    .collection("RepairJobCollection");
