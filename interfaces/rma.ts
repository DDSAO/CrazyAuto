export type ReturnItem = {
  magentoId: number;
  name: string;
  upc: string;
  sku: string;
  problem: string;
  problemType: string;
  destroy: string;
  manufacturer: string;
  date: string;

  qty: number;
  isTested: boolean;

  order_number: string;
  order_date: number;
  order_id: number;

  price: number;
  isOrderPrice?: boolean;
  tax: number;

  createdAt?: number | null;
  createdBy?: string | null;
  submittedAt?: number | null;
  submittedBy?: string | null;
  reviewedAt?: number | null;
  reviewedBy?: string | null;

  checked?: boolean;
  onTongtool?: boolean;
};

export interface RejectedItem {
  item_id: number;
  sku: string;
  reason: string;
  rejectedBy: string;
  rejectedAt: number;
  note: string;
  image: string;
  token: string;
}

export interface itemsSnapshot {
  name: string;
  qty: number;
}

export interface InternalNote {
  note: string;
  createdAt: number;
  createdBy: string;
  images?: string[];
}

export const EMPTY_RMA_INTERNAL_NOTE: InternalNote = {
  note: "",
  images: [],
  createdAt: 0,
  createdBy: "",
};

export interface RmaInfo {
  token: string;

  recieveBy?: string | null;

  recievedAt?: number | null;
  recievedBy?: string | null;
  testedAt?: number | null;
  testedBy?: string | null;
  emailSent?: number;

  note?: string | null;
  toCustomerNote?: string | null;

  returnItems?: ReturnItem[];
  rejectedItems?: RejectedItem[];
  rejectedQty?: number;

  rejectedDocuments?: string[];

  id: number;
  num: string;
  status: string;
  type: string;
  payment_method: string;
  customer_id: number;
  items?: itemsSnapshot[] | null;
  items_snapshot?: itemsSnapshot[] | null;

  tracking_number: string;
  customer_firstname: string;
  customer_lastname: string;
  customer_email: string;
  customer_phone: string;
  company: string;
  customer_group: string;

  shipping_address: {
    firstname: string;
    lastname: string;
    phone: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
  };
  customer_note?: string | null;
  created_at: number;
  updated_at: number;

  packageDescription?: string | null;

  internalNotes?: InternalNote[];

}

export interface RawRmaInfo {
  id: number;
  num: string;
  status: string;
  type: string;
  payment_method: string;

  customer_id: number;
  customer_czp_id: number | null;

  items: {
    name: string;
    qty: string;
  }[];

  tracking_number: string | null;
  customer_firstname: string;
  customer_lastname: string;
  customer_email: string;
  customer_phone: string;
  company: string;
  customer_group: string;

  shipping_address: {
    firstname: string;
    lastname: string;
    phone: string;
    address_line_1: string;
    address_line_2: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
  };

  customer_note: string;
  created_at: number;
  updated_at: number;
}
