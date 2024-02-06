export interface RawMagentoProduct {
  id: string;
  sku: string;
  upc: string;
  is_active: boolean;
  name: string;
  product_kind: string;
  product_type: string;
  quality: string;

  created_at: string;
  updated_at: string;
}

export interface RawMagentoProductWithPrices {
  id: string;
  sku: string;
  upc: string;
  is_active: boolean;
  name: string;
  product_kind: string;
  product_type: string;
  quality: string;

  created_at: string;
  updated_at: string;

  price: string; //Retailer
  group_price: {
    "1": {
      group_code: "Gold";
      price: string;
    };
    "4": {
      group_code: "Platinum";
      price: string;
    };
    "5": {
      group_code: "Diamond";
      price: string;
    };
    "7": {
      group_code: "Black";
      price: string;
    };
  };
}
