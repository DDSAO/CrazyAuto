export interface RawMagentoRma {
  id: string;
  num: string;
  status: string;
  type: string;
  payment_method: string;

  customer_id: string;

  items: {
    name: string;
    qty: number;
  }[];

  tracking_number: string | null;
  customer_firstname: string;
  customer_lastname: string;
  customer_email: string;
  customer_phone: string;
  company: string | null;
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
