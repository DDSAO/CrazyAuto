import axios from "axios";
import {
  beijingTimeToTimestamp,
  getNow,
  getTongtoolAppendix,
  sleep,
  timestampToBeijingTime,
  toTimestamp,
  toTwoDecimals,
} from "../utils";
import { ProductCollection, TongtoolProductCollection } from "../../db";
import { keyBy, omit } from "lodash";

export const syncTongtoolOrders = async () => {
  let pageNo = 1;
  let shouldContinue = true;

  while (shouldContinue) {
    let response = await axios.post(
      `https://open.tongtool.com/api-service/openapi/tongtool/ordersQuery${getTongtoolAppendix()}`,
      {
        // accountCode: "",
        merchantId: "867c7b0416daad473a756d6f0e21e6d7",
        storeFlag: "0",
        pageSize: "100",
        updatedDateFrom: timestampToBeijingTime(getNow() - 65),
        updatedDateTo: timestampToBeijingTime(getNow()),
        pageNo,
      },
      {
        headers: {
          "Content-Type": "application/json",
          api_version: "3.0",
        },
        timeout: 10000,
      }
    );
    let infos = response.data?.datas?.array ?? [];

    if (infos.length < 100) {
      shouldContinue = false;
    }

    for (const info of infos) {
      let newInfo = {
        ...info,
        buyerAccountId: parseInt(info.buyerAccountId),
        webstoreOrderId: parseInt(info.webstoreOrderId), //order id
        shippingFeeIncome: toTwoDecimals(info.shippingFeeIncome), //买家所支付的运费
        platformFee: toTwoDecimals(info.platformFee), //平台手续费
        webFinalFee: toTwoDecimals(info.webFinalFee), //平台佣金
        actualTotalPrice: toTwoDecimals(info.actualTotalPrice), //实付金额
        taxIncome: toTwoDecimals(info.taxIncome), //税费
        productsTotalPrice: toTwoDecimals(info.productsTotalPrice), //金额小计(只商品金额)
        orderAmount: toTwoDecimals(info.orderAmount), //订单总金额(商品金额+运费+保费)
        saleTimeTs: info.saleTime
          ? beijingTimeToTimestamp(info.saleTime)
          : null, //订单生成时间
        paidTimeTs: info.paidTime
          ? beijingTimeToTimestamp(info.paidTime)
          : null, //订单付款完成时间
        assignstockCompleteTimeTs: info.assignstockCompleteTime
          ? beijingTimeToTimestamp(info.assignstockCompleteTime)
          : null, //配货时间
        printCompleteTimeTs: info.printCompleteTime
          ? beijingTimeToTimestamp(info.printCompleteTime)
          : null, //订单打印完成时间
        despatchCompleteTimeTs: info.despatchCompleteTime
          ? beijingTimeToTimestamp(info.despatchCompleteTime)
          : null, //订单打印完成时间
        packageInfoList: info.packageInfoList
          ? info.packageInfoList.map((packageInfo: any) => {
              return {
                ...packageInfo,
                trackingNumberTime: toTimestamp(packageInfo.trackingNumberTime),
              };
            })
          : null,
        orderDetails: info.orderDetails
          ? info.orderDetails.map((detail: any) => {
              return {
                ...detail,
                item_id: !isNaN(parseInt(detail.webstore_item_id))
                  ? parseInt(detail.webstore_item_id)
                  : null,
                transaction_price: toTwoDecimals(detail.transaction_price),
              };
            })
          : null,
        goodsInfo: {
          platformGoodsInfoList: info.goodsInfo.platformGoodsInfoList.map(
            (item: any) => {
              return {
                ...item,
                item_id: !isNaN(parseInt(item.webstoreItemId))
                  ? parseInt(item.webstoreItemId)
                  : null,
              };
            }
          ),
          tongToolGoodsInfoList: info.goodsInfo.tongToolGoodsInfoList.map(
            (item: any) => {
              let matchedItem = info.goodsInfo.platformGoodsInfoList.find(
                (platformGood: any) =>
                  platformGood.webTransactionId === item.wotId
              );
              return {
                ...item,
                item_id: matchedItem
                  ? !isNaN(parseInt(matchedItem.webstoreItemId))
                    ? parseInt(matchedItem.webstoreItemId)
                    : null
                  : null,
              };
            }
          ),
        },
      };
    }

    await sleep(12000);
  }
};
