export type OrderLinesRow = {
  item_id: number;
  sku: string;
  name: string;
  qty: number;
  unit_price_exc_tax: number;
  tax: number; //total tax
  discount_amount: number; //total discount amount
  row_total_inc_tax: number; //unit_price_exc_tax * qty + tax + discount_amount
  class: string;
  upc: string;
  product_type: string;
  product_kind: string;
};

export interface OrderRefundRow {
  order_id: number | null;
  salesRecordNumber: string;
  customer_id: number;
  item_id: number;
  sku: string;
  upc: string;
  name: string;
  qty: number;
  maxQty: number;
  unitPrice: number;
  discount: 0;
  tax: number;
  amount: number; //amount = (unitPrice - discount) * qty
  refundReason: string;
  createdAt: number;
  createdBy: string;
  paidAt: number;
  paidBy: string;
  notifiedByEmailAt: number;
  notifiedByEmailBy: string;
  notifiedBySMSAt: number;
  notifiedBySMSBy: string;
}

export type OrderAddress = {
  firstname: string;
  lastname: string;
  company: string;
  phone: string;
  address_line_1: string;
  address_line_2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
};

export interface NextOrderAddress {
  name: string;
  phone: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
}

export const EMPTY_NEXT_ORDER_ADDRESS: NextOrderAddress = {
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

export interface NextOrderItem {
  itemId: number | null;
  sku: string;
  upc: string;
  name: string;
  unitPrice: number;
  qty: number;
  qtyRefunded?: number;
  productKind: string;
  subtotal: number; // = unitPrice * qty
  discountAmount: number; // exc tax
  tax: number; // = (unitPrice * qty - discountAmount) * 0.1
  total: number; // = unitPrice * qty - discountAmount + tax
}

export interface NextOrderFee {
  subtotal: number;
  discount: number;
  tax: number;
  shippingFee: number;
  insuranceFee: number;
  otherFee: number;
  total: number; // = subtotal_exc_tax - discount + tax + shippingFee  + otherFee
}

export const EMPTY_NEXT_ORDER_FEE: NextOrderFee = {
  subtotal: 0,
  discount: 0,
  tax: 0,
  shippingFee: 0,
  insuranceFee: 0,
  otherFee: 0,
  total: 0,
};

export interface NextPaymentRow {
  serialId: number;
  type: string;
  amount: number;
  paidAt: number;
  createdAt: number;
  createdBy: string;
  reviewedAt?: number;
  reviewedBy?: string;
}

export interface NextOrder {
  serialId: number;
  platform: string;
  platformId: number;
  status: string;

  customer: {
    customerId: number | null;
    firstName: string;
    lastName: string;
    level: string;
    phone: string;
    email: string;
  };
  shippingAddress: NextOrderAddress;
  items: NextOrderItem[];

  payment: {
    code: string;
    name: string;
  };
  payments: NextPaymentRow[];

  shippingMethod: {
    code: string;
    name: string;
    cost?: number | null;
    shipmentId?: string | null;
    trackingNumber?: string | null;
    consignmentId?: string | null;
    shippingLabelRequestId?: string | null;
    shippingLabelUrl?: string | null;
  };
  fees: NextOrderFee;
  timelines: {
    createdAt: number;
    createdBy: string;
    paidAt?: number;
    paidBy?: string;
    dispatchedAt?: number;
    dispatchedBy?: string;
    updatedAt: number;
    updatedBy: string;
  };
}

export interface RawPrestaOrder {
  id: number;
  store_id: number;
  status: string;
  order_number: string;
  has_refund: boolean;
  currency: string;
  subtotal_exc_tax: number;
  tax: number;
  shipping: number;
  grand_total: number;
  customer_note: string;
  account_manager_id: number;
  customer_id: number;
  customer_group: string;
  customer_firstname: string;
  customer_lastname: string;
  customer_email: string;
  customer_phone: string;
  shipping_address: {
    firstname: string;
    lastname: string;
    company: string;
    phone: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
  };
  payment: {
    method_code: string | null;
    method_name: string | null;
    trans_id: string | null;
  };
  shipment: {
    method_code: string | null;
    method_name: string | null;
  };
  lines: {
    id: number;
    item_id: number;
    sku: string;
    name: string;
    qty: number;
    qty_refunded: number;
    unit_price_exc_tax: number;
    tax: number;
    row_total_inc_tax: number;
    product_kind: string;
  }[];
  order_date: number;
  created_at: number;
  updated_at: number;
}
