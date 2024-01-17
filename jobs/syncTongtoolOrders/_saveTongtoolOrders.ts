import { keyBy } from "lodash";
import {
  CustomerCollection,
  ProductCollection,
  TongtoolOrderCollection,
} from "../../db";
import {
  RawTongtoolOrder,
  TongtoolOrder,
} from "../../interfaces/tongtoolOrder";
import { beijingTimeToTimestamp, getDaysAgo, toTwoDecimals } from "../utils";
import { handleOos } from "./_handleOos";
import { notifyPickup } from "./_notifyPickup";

export const saveTongtoolOrders = async (orders: RawTongtoolOrder[]) => {
  let prestaOrders = orders.filter(
    (order) => order.orderIdCode && order.orderIdCode.startsWith("CP")
  );

  let customers = await CustomerCollection.find({
    prestaId: {
      $in: prestaOrders.map((order) => parseInt(order.buyerAccountId)),
    },
  }).toArray();
  let customersDict = keyBy(customers, "prestaId");

  let productsSet = new Set<number>();
  for (const order of orders) {
    for (const row of order.orderDetails) {
      productsSet.add(parseInt(row.webstore_item_id));
    }
    for (const row of order.goodsInfo.platformGoodsInfoList) {
      productsSet.add(parseInt(row.webstoreItemId));
    }
  }
  let products = await ProductCollection.find({
    prestaId: { $in: Array.from(productsSet) },
  }).toArray();
  let productsDict = keyBy(products, "prestaId");

  let originOrders = await TongtoolOrderCollection.find({
    orderIdCode: orders.map((order) => order.orderIdCode),
  }).toArray();
  let originOrdersDict = keyBy(originOrders, "orderIdCode");

  let parsedOrders: TongtoolOrder[] = prestaOrders.map((order) => {
    let matchedCustomer = customersDict[order.buyerAccountId];
    let platformGoodsInfoListDict = keyBy(
      order.goodsInfo.platformGoodsInfoList,
      "webTransactionId"
    );
    return {
      ...order,
      buyerAccountId: matchedCustomer?.id ?? null,
      webstoreOrderId: parseInt(order.webstoreOrderId), //order id, didnt changed
      shippingFeeIncome: toTwoDecimals(order.shippingFeeIncome), //买家所支付的运费
      platformFee: toTwoDecimals(order.platformFee), //平台手续费
      webFinalFee: toTwoDecimals(order.webFinalFee), //平台佣金
      actualTotalPrice: toTwoDecimals(order.actualTotalPrice), //实付金额
      taxIncome: toTwoDecimals(order.taxIncome), //税费
      productsTotalPrice: toTwoDecimals(order.productsTotalPrice), //金额小计(只商品金额)
      orderAmount: toTwoDecimals(order.orderAmount), //订单总金额(商品金额+运费+保费)
      saleTimeTs: order.saleTime
        ? beijingTimeToTimestamp(order.saleTime)
        : null, //订单生成时间
      paidTimeTs: order.paidTime
        ? beijingTimeToTimestamp(order.paidTime)
        : null, //订单付款完成时间
      assignstockCompleteTimeTs: order.assignstockCompleteTime
        ? beijingTimeToTimestamp(order.assignstockCompleteTime)
        : null, //配货时间
      printCompleteTimeTs: order.printCompleteTime
        ? beijingTimeToTimestamp(order.printCompleteTime)
        : null, //订单打印完成时间
      despatchCompleteTimeTs: order.despatchCompleteTime
        ? beijingTimeToTimestamp(order.despatchCompleteTime)
        : null, //订单打印完成时间
      packageInfoList: order.packageInfoList,
      orderDetails: order.orderDetails
        ? order.orderDetails.map((detail) => {
            let matchedProduct = productsDict[detail.webstore_item_id];
            return {
              ...detail,
              item_id: matchedProduct?.id ?? null,
              transaction_price: toTwoDecimals(detail.transaction_price),
            };
          })
        : [],
      goodsInfo: {
        platformGoodsInfoList: order.goodsInfo.platformGoodsInfoList.map(
          (item: any) => {
            let matchedProduct = productsDict[item.webstoreItemId];
            return {
              ...item,
              item_id: matchedProduct?.id ?? null,
            };
          }
        ),
        tongToolGoodsInfoList: order.goodsInfo.tongToolGoodsInfoList.map(
          (item: any) => {
            let matchedItem = platformGoodsInfoListDict[item.wotId];
            let matchedProduct = productsDict[matchedItem.webstoreItemId];
            return {
              ...item,
              item_id: matchedProduct?.id ?? null,
            };
          }
        ),
      },
    };
  });

  for (const order of parsedOrders) {
    //save tongtool order
    await TongtoolOrderCollection.updateOne(
      {
        orderIdCode: order.orderIdCode,
      },
      {
        $set: {
          ...order,
        },
      },
      { upsert: true }
    );
  }

  return parsedOrders;
};
