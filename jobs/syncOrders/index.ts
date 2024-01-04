import { keyBy } from "lodash";
import {
  CustomerCollection,
  NextOrderCollection,
  ProductCollection,
} from "../../db";
import { getSeq, sendGetRequest } from "../utils";

export const syncOrders = async (start: number, end: number) => {
  let firstRequest = await sendGetRequest(
    `/order/list?page_no=1&page_size=50&&from_update_time=${start}&to_update_time=${end}`
  );
  let orders = [];
  if (firstRequest.total) {
    let { total } = firstRequest;
    orders = firstRequest.orders;

    for (let i = 0; i < Math.ceil(total / 50); i++) {
      let res = await sendGetRequest(
        `/order/list?page_no=${
          i + 2
        }&page_size=50&&from_update_time=${start}&to_update_time=${end}`
      );
      orders = orders.concat(res.orders);
    }
  }

  let productSet = new Set<number>(),
    customerSet = new Set<number>();
  for (const order of orders) {
    customerSet.add(order.customer_id);
    for (const line of order.lines) {
      productSet.add(line.item_id);
    }
  }

  let originOrders = await NextOrderCollection.find({
    platform: "presta",
    platformId: {
      $in: orders.map((order: any) => order.id),
    },
  });
  let originsDict = keyBy(originOrders, "id");

  let products = await ProductCollection.find({
    prestaId: {
      $in: Array.from(productSet),
    },
  }).toArray();
  let productsDict = keyBy(products, "prestaId");

  let customers = await CustomerCollection.find({
    prestaId: {
      $in: Array.from(customerSet),
    },
  }).toArray();
  let customersDict = keyBy(customers, "prestaId");

  for (const order of orders) {
    let nextCustomerId = customersDict[order.customer_id] || null;
    let origin = originsDict[order.id];

    if (origin) {
    } else {
      let serialId = await getSeq("next_order");
    }
  }

  return [];
};
