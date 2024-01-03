export interface ProductPrices {
  Retailer: number | null;
  Gold: number | null;
  Platinum: number | null;
  Diamond: number | null;
  Black: number | null;
}

export interface Product {
  id: number;
  name: string;
  magentoId?: number | null;
  class: string;
  created_at: number;
  updated_at: number;
  prices: ProductPrices;
  product_kind: string;
  product_type: string;
  sku: string;
  upc: string | null;
  quality: string;

  prestaId?: number | null;
}
