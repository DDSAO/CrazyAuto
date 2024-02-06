import { keyBy } from "lodash";
import {
  CustomerCollection,
  NextOrderCollection,
  OrderCollection,
  ProductCollection,
} from "../../../db";
import { RawPrestaOrder } from "../../../interfaces/order";
import { getNow, getSeq, toTwoDecimals } from "../../utils";
import { RawMagentoOrder } from "../../../interfaces/magento/order";

export const saveOrders = async (orders: RawMagentoOrder[]) => {
  let productSet = new Set<number>(),
    customerSet = new Set<number>();
  for (const order of orders) {
    customerSet.add(order.customer_id);
    for (const line of order.lines) {
      productSet.add(line.item_id);
    }
  }

  let products = await ProductCollection.find({
    id: {
      $in: Array.from(productSet),
    },
  }).toArray();
  let productsDict = keyBy(products, "id");

  let customers = await CustomerCollection.find({
    id: {
      $in: Array.from(customerSet),
    },
  }).toArray();
  let customersDict = keyBy(customers, "id");

  for (const order of orders) {
    let nextCustomer = customersDict[order.customer_id] || null;

    await OrderCollection.updateOne(
      {
        id: order.id,
      },
      {
        $set: {
          ...order,
          customer_id: nextCustomer?.id ?? 0,
          shipment: {
            method_code: order.shipment.method_code ?? "",
            method_name: order.shipment.method_name ?? "",
          },
          payment: {
            method_code: order.payment.method_code ?? "",
            method_name: order.payment.method_name ?? "",
          },
          lines: order.lines.map((line) => {
            return {
              ...line,
              item_id: productsDict[line.item_id]?.id,
              upc: productsDict[line.item_id]?.upc ?? "",
              class: productsDict[line.item_id]?.class ?? "unclassified",
              product_kind: productsDict[line.item_id]?.product_kind ?? "",
              product_type: productsDict[line.item_id]?.product_type ?? "",
              discount_amount: line.discount_amount,
            };
          }),
          order_date: parseInt(order.order_date),
          created_at: parseInt(order.created_at),
          updated_at: parseInt(order.updated_at),
          lastSyncAt: getNow(),
          geoCoding: {
            lng: 0,
            lat: 0,
          },
        },
      },
      { upsert: true }
    );
  }
};
