export interface PlatformGoodsInfoListRow {
  webstoreCustomLabel: string | null;
  item_id: number | null;
  quantity: number;
  webstoreSku: string | null;
  product_id: string | null;
  webstoreItemId: number;
  webTransactionId: string;
}

export interface TongtoolGoodsInfoList {
  quantity: number;
  goodsSku: string;
  productName: string;
  item_id: number | null;
  wotId: string;
}

export interface PackageInfoListRow {
  trackingNumberStatus: string | null;
  trackingNumberTime: number | null;
  packageId: string | null;
  trackingNumber: string | null;
}

export interface orderDetailsRow {
  goodsMatchedSku: string;
  orderDetailsId: string;
  webstore_sku: string;
  quantity: number;
  goodsMatchedQuantity: number;
  webstore_item_id: string;
  transaction_price: number;
  webstore_custom_label: string;
  item_id: number;
}
export interface TongtoolOrder {
  orderIdKey: string;
  actualTotalPrice: number;
  orderAmount: number;
  orderAmountCurrency: string;
  productsTotalPrice: number;
  productsTotalCurrency: string;
  orderIdCode: string;
  orderStatus: string;
  parentOrderId: string | null;
  salesRecordNumber: string | null;

  isInvalid: string;
  isRefunded: string | null;
  isSuspended: string | null;

  buyerAccountId: number;
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

  firstTariff: number;
  platformFee: number;
  shippingFee: number;
  shippingFeeIncome: number;
  shippingFeeIncomeCurrency: string;
  taxIncome: number;
  taxCurrency: string;
  webFinalFee: number;
  webstoreOrderId: number;

  warehouseIdKey: string;
  warehouseName: string;

  carrier: string | null;
  carrierType: string | null;
  carrierUrl: string | null;
  dispathTypeName: string | null;
  merchantCarrierShortname: string | null;

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

  goodsInfo: {
    platformGoodsInfoList: PlatformGoodsInfoListRow[];
    tongToolGoodsInfoList: TongtoolGoodsInfoList[];
  };
  packageInfoList: PackageInfoListRow[];
  orderDetails: orderDetailsRow[];

  picker?: string | null;
  pickerToken?: string | null;
  pickingStartedAt?: number | null;

  packer?: string | null;
  packedStartedAt?: number | null;

  deliveredAt?: number | null;
  deliveredBy?: string | null;
}

export interface RawTongtoolOrder {
  actualTotalPrice: number;
  assignstockCompleteTime: string;
  buyerAccountId: string;
  buyerCity: string;
  buyerCountry: string;
  buyerEmail: string;
  buyerMobile: string;
  buyerName: string;
  buyerPassportCode: string;
  buyerPhone: string;
  buyerShippingMethod: string;
  buyerState: string;
  carrier: string;
  carrierType: string;
  carrierUrl: string;
  despatchCompleteTime: string;
  dispathTypeName: string;
  downloadTime: string;
  earliestDeliveryDate: string;
  ebayNotes: string;
  ebaySiteEnName: string;
  firstTariff: number;
  goodsInfo: {
    platformGoodsInfoList: {
      customizedUrl: string;
      product_id: string;
      properties: string;
      quantity: number;
      webTransactionId: string;
      webstoreCustomLabel: string;
      webstoreItemId: string;
      webstoreSku: string;
    }[];
    tongToolGoodsInfoList: {
      goodsAverageCost: number;
      goodsCurrentCost: number;
      goodsImageGroupId: string;
      goodsPackagingCost: number;
      goodsPackagingWeight: number;
      goodsSku: string;
      goodsTitle: string;
      goodsWeight: number;
      packageHeight: number;
      packageLength: number;
      packageWidth: number;
      packagingCost: number;
      packagingWeight: number;
      productAverageCost: number;
      productCurrentCost: number;
      productHeight: number;
      productLength: number;
      productName: string;
      productWeight: number;
      productWidth: number;
      quantity: number;
      salePrice: number;
      wotId: string;
    }[];
  };
  insuranceIncome: number;
  insuranceIncomeCurrency: string;
  isInvalid: string;
  isRefunded: string;
  isSuspended: string;
  latestDeliveryDate: string;
  merchantCarrierShortname: string;
  orderAmount: number;
  orderAmountCurrency: string;
  orderDetails: {
    goodsDetailRemark: string;
    goodsMatchedQuantity: number;
    goodsMatchedSku: string;
    location: string;
    orderDetailsId: string;
    quantity: number;
    transaction_price: number;
    webstore_custom_label: string;
    webstore_item_id: string;
    webstore_sku: string;
  }[];
  orderIdCode: string;
  orderIdKey: string;
  orderRemarkList: string[];
  orderStatus: string;
  packageInfoList: {
    packageId: string;
    trackingNumber: string;
    trackingNumberStatus: string;
    trackingNumberTime: string;
  }[];
  paidTime: string;
  parentOrderId: string;
  platformCode: string;
  platformFee: number;
  postalCode: string;
  printCompleteTime: string;
  productsTotalCurrency: string;
  productsTotalPrice: number;
  receiveAddress: string;
  refundedTime: string;
  saleAccount: string;
  saleTime: string;
  salesRecordNumber: string;
  shippingFee: number;
  shippingFeeIncome: number;
  shippingFeeIncomeCurrency: string;
  shippingLimiteDate: string;
  taxCurrency: string;
  taxIncome: number;
  updatedTime: string;
  warehouseIdKey: string;
  warehouseName: string;
  webFinalFee: number;
  webstoreOrderId: string;
  webstore_item_site: string;
}
