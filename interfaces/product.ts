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

export interface RawPrestaProduct {
  id: number;
  sku: string;
  upc: string;
  is_active: boolean;
  name: string;
  product_kind: string;
  product_type: string;
  quality: string;
  czp_id: number;
  created_at: number;
  updated_at: number;
  price: number; //Retailer
  group_price: {
    "4": {
      group_code: "Gold";
      price: number;
    };
    "5": {
      group_code: "Platinum";
      price: number;
    };
    "6": {
      group_code: "Diamond";
      price: number;
    };
    "7": {
      group_code: "Black";
      price: number;
    };
  };
}

export interface RawTongtoolProduct {
  brandName: string;
  categoryName: string;
  createdDate: string;
  goodsDetail: {
    goodsAveCost: number;
    goodsCurCost: number;
    goodsDetailId: string;
    goodsSku: string;
    goodsWeight: number;
  }[];

  packageCost: number;
  packageWeight: number;

  sku: string;
  status: string | null;

  productName: string;
}

export interface TongtoolProduct extends RawTongtoolProduct {
  goodsSku: string;
  goodsAveCost: number;
  goodsCurCost: number;
  goodsWeight: number;
  productType: number;
  itemId: number | null;
}
