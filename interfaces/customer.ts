export interface MagentoCustomerAddress {
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
}

export interface Customer {
  id: number;
  prestaId?: number;
  token: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  group_id: number;
  group_name: string;
  account_manager_id: number | null;
  account_manager_name: string | null;
  address?: MagentoCustomerAddress | null;
  business_approve_status: string;

  unsubscriptions?: string[] | null;
  emails?: string[] | null;

  business_name?: string | null;
  abn?: string | null;

  createdAt: number;
  updatedAt: number;
  lastSyncAt: number;
}

export interface RawPrestaCustomer {
  id: number;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  group_id: number;
  group_name: string;
  account_manager_id: number;
  account_manager_name: string | null;
  account_type: string;
  business_approve_status: string;
  abn: string;
  business_name: string;
  czp_id: string;
  created_at: number;
  updated_at: number;
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
