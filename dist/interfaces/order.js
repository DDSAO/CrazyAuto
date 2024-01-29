"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.COMPLETED_ORDER_STATUS = exports.EMPTY_NEXT_ORDER_FEE = exports.EMPTY_NEXT_ORDER_ADDRESS = void 0;
exports.EMPTY_NEXT_ORDER_ADDRESS = {
    name: "",
    phone: "",
    email: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postcode: "",
    country: "",
};
exports.EMPTY_NEXT_ORDER_FEE = {
    subtotal: 0,
    discount: 0,
    tax: 0,
    shippingFee: 0,
    insuranceFee: 0,
    otherFee: 0,
    total: 0,
};
exports.COMPLETED_ORDER_STATUS = [
    "stock_taken",
    "complete",
    "stock_pick_up_cs",
    "closed",
    "processing",
    "processing_warehouse",
];
