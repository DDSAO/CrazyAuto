export interface RawRepairJob {
  id: string;
  num: string;
  status: string;
  customer_id: string;
  customer_group_code: string;
  description: string | null;

  firstname: string;
  lastname: string;
  business_name: string | null;
  email: string | null;
  phone: string | null;
  address_line: string | null;
  address_line_2: string | null;
  city: string | null;
  state: string | null;
  postcode: string | null;

  items: {
    name: string;
    price: string;
    passcode: string;
    imei: string;
    note: string;
    questions: {
      price: string;
      name: string;
    }[];

    gst: string;
    grand_total: string;
    payment_method: string;
    shipping_method: string;
    created_at_ts: string;
    updated_at_ts: string;
  }[];
}

export interface RepairJob {
  serialId: number;
  prestaId: number;
  prestaNum: string;
  status: string;
}
