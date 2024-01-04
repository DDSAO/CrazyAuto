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
  token: string;
  firstname: string;
  lastname: string;
  email: string;
  phone: string;
  group_id: number;
  group_name: string;
  account_manager_id: number;
  account_manager_name: string;
  lastSyncAt: number;
  address?: MagentoCustomerAddress | null;

  unsubscriptions?: string[] | null;
  emails?: string[] | null;

  business_name?: string | null;
  abn?: string | null;

  relatedPortfolioId?: number | null;

  createdAt: number;
}
