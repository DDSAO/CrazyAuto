export type BuybackItem = {
  item_id: number;
  name: string;
  category: string;
  aQty: number;
  bQty: number;
  cQty: number;
  dQty: number;
  unqualifiedQty: number;
  sort: number;

  qualifiedQty: number;
  priceA: number | null;
  priceB: number | null;
  priceC: number | null;
  priceD: number | null;
  priceUnqualified?: number | null;
  total: number;

  note: string;
};

export type PaymentAdjustment = {
  title: string;
  amount: number;
  note: string;
  adjustBy: string;
};

export type AddressInfo = {
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postcode: string;
};

export type BankingInfo = {
  bankName: string;
  accountName: string;
  bsb: string;
  accountNumber: string;
};

export type BuybackInfo = {
  id: number;
  token: string;
  num: string;
  status: string;
  customer_id: number;
  customer_group: string;
  email: string;
  phone: string;
  name: string;
  items: BuybackItem[];
  address_line: string;
  city: string;
  state: string;
  postcode: string;
  payment_method: string;
  tracking_no: string;
  created_at: number;
  customerNeedPostBack: boolean;

  appliedPriceBoard?: string | null;
  appliedPriceSourceId?: number | null;

  adjustments: PaymentAdjustment[];
  paymentType?: string | null;
  disposeType?: string | null;
  customerConfirmPostBack?: boolean | null;
  customerConfirmAddress?: AddressInfo | null;
  customerConfirmBanking?: BankingInfo | null;

  fetchedAt?: number | null;
  fetchBy?: string | null;
  recievedAt?: number | null;
  recieveBy?: string | null;
  testedAt?: number | null;
  testBy?: string | null;
  confirmedAt?: number | null;
  confirmBy?: string | null;
  paidAt?: number | null;
  payBy?: string | null;
  disposedAt?: number | null;
  disposedBy?: string | null;
  ratedAt?: number | null;
  ratedBy?: string | null;
  updatedAt?: number | null;
  updateBy?: string | null;

  uploadedPath?: string | null;

  history: string[];

  notProcessedQty: number | null;
  notProcessedReason: string | null;
  appliedUnqualifiedPrice?: boolean | null;

  unqualifiedWeight?: number | null;
  unqualifiedPackageLength?: number | null;
  unqualifiedPackageWidth?: number | null;
  unqualifiedPackageHeight?: number | null;
  postBackFee?: number | null;
  postBackTongtoolOrder?: string | null;

  packageDescription?: string | null;

  purchaseOrderNumber?: string | null;
  purchasedAt?: number | null;
  purchasedBy?: string | null;
  stockedInAt?: number | null;
  stockedInBy?: string | null;
};

export interface RawBuybackInfo {
  id: number;
  num: string;
  status: number;
}
