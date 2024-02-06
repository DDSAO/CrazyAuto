export interface RawMagentoOrder {
  id: number;
  store_id: number;
  status: string;
  order_number: string;
  currency: string;
  subtotal_exc_tax: number;
  tax: number;
  shipping: number;
  grand_total: number;
  customer_note: string | null;
  account_manager_id: number;
  customer_id: number;
  customer_group: string;
  customer_firstname: string;
  customer_lastname: string;
  customer_email: string;
  customer_phone: string | null;
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
    unit_price_exc_tax: number;
    tax: number;
    row_total_inc_tax: number;
    discount_amount: number;
  }[];
  order_date: string;
  created_at: string;
  updated_at: string;
}
