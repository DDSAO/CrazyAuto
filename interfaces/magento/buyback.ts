export type BuybackPriceBoardRow = {
  item_id: number;
  priceA: number | null;
  priceB: number | null;
  priceC: number | null;
  priceD: number | null;
  currency: string;

  primaryPriceA?: number | null;
  primaryPriceB?: number | null;
  primaryPriceC?: number | null;
  primaryPriceD?: number | null;
  localPriceA?: number | null;
  localPriceB?: number | null;
  localPriceC?: number | null;
  localPriceD?: number | null;
  deliveryFee?: number | null;
  HKDeliveryFee?: number | null;
  commission?: number | null;
  damageRate?: number | null;
};

export type BuybackPriceSource = {
  sourceId?: number | null;
  source: string;
  currency: string;
  type: string;

  createBy: string;
  createdAt: number;

  isSecret: boolean;

  list: BuybackPriceBoardRow[];
};

export interface BuybackItemModel {
  item_id: number;
  name: string;
  category: string;
  sort: number;
  upc: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
}
