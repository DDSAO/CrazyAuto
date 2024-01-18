import { keyBy } from "lodash";
import { OrderCollection } from "../../db";
import { COMPLETED_ORDER_STATUS } from "../../interfaces/order";
import { getNow, timestampToDateTimeStr } from "../utils";
import { getOrderStatusByIds } from "./_getOrderStatusByIds";

export const updateOrderStatusByIds = async (verbose?: boolean) => {
  let notSettledOrders = await OrderCollection.aggregate([
    {
      $match: {
        order_date: {
          $gte: getNow() - 86400 * 21,
        },
        status: {
          $nin: COMPLETED_ORDER_STATUS,
        },
      },
    },
    {
      $project: {
        id: 1,
        status: 1,
      },
    },
  ]).toArray();

  if (verbose)
    console.log(
      timestampToDateTimeStr(getNow()),
      "=>",
      "unsettle orders",
      notSettledOrders.length
    );

  for (let i = 0; i < Math.ceil(notSettledOrders.length / 50); i++) {
    let originOrders = notSettledOrders.slice(i * 50, (i + 1) * 50);
    let response = await getOrderStatusByIds(
      originOrders.map((order) => order.id)
    );
    let orders = response.rmas;
    let originOrdersDict = keyBy(originOrders, "id");
    for (const order of orders) {
      let origin = originOrdersDict[order.id];
      if (origin && order.status && origin.status !== order.status) {
        await OrderCollection.updateOne(
          { id: order.id },
          {
            $set: {
              status: order.status,
              created_at: order.created_at,
              updated_at: order.updated_at,
              lastSyncAt: getNow(),
            },
          }
        );
      }
    }
  }
};
