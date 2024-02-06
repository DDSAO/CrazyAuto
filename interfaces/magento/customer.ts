export interface RawMagentoCustomer {
  id: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  group_id: string;
  group_name: string;
  account_manager_id: string | null;
  account_manager_name: string | null;
  account_type: string;
  business_approve_status: string;
  abn: string;
  business_name: string;

  created_at: string;
  updated_at: string;
  address: null | {
    entity_id: string;
    entity_type_id: string;
    attribute_set_id: string;
    increment_id: string | null;
    parent_id: string;
    created_at: string;
    updated_at: string;
    is_active: string;
    firstname: string;
    lastname: string;
    company: string;
    city: string;
    country_id: string;
    region: string;
    postcode: string;
    telephone: string;
    region_id: string;
    street: string;
    customer_id: string;
  };
}
