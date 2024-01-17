export interface RawOrderDetailsRow {
  goodsMatchedSku: string;
  orderDetailsId: string;
  webstore_sku: string;
  quantity: number;
  goodsMatchedQuantity: number;
  webstore_item_id: string;
  transaction_price: number;
  webstore_custom_label: string;
}

export interface OrderDetailsRow extends RawOrderDetailsRow {
  item_id: number;
}
export interface RawPlatformGoodsInfoListRow {
  webstoreCustomLabel: string | null;
  quantity: number;
  webstoreSku: string | null;
  product_id: string | null;
  webstoreItemId: string;
  webTransactionId: string;
}

export interface PlatformGoodsInfoListRow extends RawPlatformGoodsInfoListRow {
  item_id: number;
}

export interface RawTongtoolGoodsInfoList {
  quantity: number;
  goodsSku: string;
  productName: string;
  wotId: string;
  productWeight: number | null;
  packagingWeight: number | null;
  goodsWeight: number | null;
}

export interface TongtoolGoodsInfoList extends RawTongtoolGoodsInfoList {
  item_id: number;
}
export interface RawTongtoolOrder {
  webstoreOrderId: string;
  isInvalid: string | null;
  salesRecordNumber: string;
  orderIdCode: string;

  buyerAccountId: string;
  buyerCity: string | null;
  buyerCountry: string | null;
  buyerEmail: string | null;
  buyerMobile: string | null;
  buyerName: string | null;
  buyerPhone: string | null;
  buyerState: string | null;
  postalCode: string | null;
  ebayNotes: string | null;
  ebaySiteEnName: string | null;
  receiveAddress: string | null;

  orderDetails: RawOrderDetailsRow[];
  goodsInfo: {
    platformGoodsInfoList: RawPlatformGoodsInfoListRow[];
    tongToolGoodsInfoList: RawTongtoolGoodsInfoList[];
  };
  packageInfoList: {
    trackingNumberStatus: string | null;
    trackingNumberTime: number | null;
    packageId: string | null;
    trackingNumber: string | null;
  }[];

  carrier: string;
  dispathTypeName: string;
  merchantCarrierShortname: string;

  firstTariff: number;
  platformFee: number;
  shippingFee: number;
  shippingFeeIncome: number;
  shippingFeeIncomeCurrency: string;
  taxIncome: number;
  taxCurrency: string;
  webFinalFee: number;
  actualTotalPrice: number;
  productsTotalPrice: number;
  orderAmount: number;

  saleTime?: string | null;
  paidTime?: string | null;
  assignstockCompleteTime?: string | null;
  printCompleteTime?: string | null;
  despatchCompleteTime?: string | null;

  warehouseIdKey: string;
  warehouseName: string;
}

export interface TongtoolOrder {
  webstoreOrderId: number; //diff
  isInvalid: string | null;
  salesRecordNumber: string;
  orderIdCode: string;

  buyerAccountId: number; //diff
  buyerCity: string | null;
  buyerCountry: string | null;
  buyerEmail: string | null;
  buyerMobile: string | null;
  buyerName: string | null;
  buyerPhone: string | null;
  buyerState: string | null;
  postalCode: string | null;
  ebayNotes: string | null;
  ebaySiteEnName: string | null;
  receiveAddress: string | null;

  orderDetails: OrderDetailsRow[];
  goodsInfo: {
    platformGoodsInfoList: PlatformGoodsInfoListRow[];
    tongToolGoodsInfoList: TongtoolGoodsInfoList[];
  };
  packageInfoList: {
    trackingNumberStatus: string | null;
    trackingNumberTime: number | null;
    packageId: string | null;
    trackingNumber: string | null;
  }[];

  carrier: string;
  dispathTypeName: string;
  merchantCarrierShortname: string;

  firstTariff: number;
  platformFee: number;
  shippingFee: number;
  shippingFeeIncome: number;
  shippingFeeIncomeCurrency: string;
  taxIncome: number;
  taxCurrency: string;
  webFinalFee: number;
  actualTotalPrice: number;
  productsTotalPrice: number;
  orderAmount: number;

  saleTime?: string | null;
  paidTime?: string | null;
  assignstockCompleteTime?: string | null;
  printCompleteTime?: string | null;
  despatchCompleteTime?: string | null;

  saleTimeTs?: number | null;
  paidTimeTs?: number | null;
  assignstockCompleteTimeTs?: number | null;
  printCompleteTimeTs?: number | null;
  despatchCompleteTimeTs?: number | null;

  warehouseIdKey: string;
  warehouseName: string;

  picker?: string | null;
  pickingStartedAt?: number | null;

  packer?: string | null;
  packedStartedAt?: number | null;
}
