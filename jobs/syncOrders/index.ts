import { keyBy } from "lodash";
import {
  CustomerCollection,
  NextOrderCollection,
  ProductCollection,
} from "../../db";
import { getNow, getSeq, sendGetRequest, toTwoDecimals } from "../utils";
import { RawPrestaOrder } from "../../interfaces/order";

export const syncOrders = async (start: number, end: number) => {
  let firstRequest = await sendGetRequest(
    `/order/list?page_no=1&page_size=50&&from_update_time=${start}&to_update_time=${end}`
  );
  let orders: RawPrestaOrder[] = [];
  if (firstRequest.total) {
    let { total } = firstRequest;
    orders = firstRequest.orders;

    for (let i = 0; i < Math.ceil(total / 50); i++) {
      console.log(i + 1, Math.ceil(total / 50));
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
    let nextCustomer = customersDict[order.customer_id] || null;
    let origin = originsDict[order.id];

    if (origin) {
      await NextOrderCollection.updateOne(
        {
          platform: "presta",
          platformId: order.id,
        },
        {
          $set: {
            status: order.status,
            "customer.customerId": nextCustomer?.id || null,
            items: order.lines.map((line) => {
              let product = productsDict[line.item_id];
              return {
                itemId: product?.id || null,
                sku: line.sku,
                upc: product?.upc ?? "",
                name: line.name,
                unitPrice: line.unit_price_exc_tax,
                qty: line.qty,
                qtyRefunded: line.qty_refunded,
                subtotal: toTwoDecimals(line.unit_price_exc_tax * line.qty),
                discountAmount: 0,
                tax: line.tax,
                total: line.row_total_inc_tax,
                productKind: line.product_kind,
              };
            }),
            "timelines.updatedAt": getNow(),
            "timelines.updatedBy": "auto process",
          },
        }
      );
    } else {
      let serialId = await getSeq("next_order", 1000);
      let paymentSerialId = await getSeq("next_payment");
      await NextOrderCollection.insertOne({
        serialId,
        platform: "presta",
        platformId: order.id,
        status: order.status,
        customer: {
          customerId: nextCustomer?.id || null,
          firstName: order.customer_firstname,
          lastName: order.customer_lastname,
          level: order.customer_group,
          phone: order.customer_phone,
          email: order.customer_email,
        },
        shippingAddress: {
          name: order.shipping_address.company,
          phone: order.shipping_address.phone,
          email: nextCustomer?.email || "",
          addressLine1: order.shipping_address.address_line_1,
          addressLine2: order.shipping_address.address_line_2,
          city: order.shipping_address.city,
          state: order.shipping_address.state,
          postcode: order.shipping_address.postcode,
          country: order.shipping_address.country,
        },
        items: order.lines.map((line) => {
          let product = productsDict[line.item_id];
          return {
            itemId: product?.id || null,
            sku: line.sku,
            upc: product?.upc ?? "",
            name: line.name,
            unitPrice: line.unit_price_exc_tax,
            qty: line.qty,
            qtyRefunded: line.qty_refunded,
            subtotal: toTwoDecimals(line.unit_price_exc_tax * line.qty),
            discountAmount: 0,
            tax: line.tax,
            total: line.row_total_inc_tax,
            productKind: line.product_kind,
          };
        }),
        payment: {
          code: order.payment.method_code ?? "",
          name: order.payment.method_name ?? "",
        },
        payments: [
          {
            serialId: paymentSerialId,
            type: order.payment.method_code ?? "presta_unknown",
            amount: order.grand_total,
            paidAt: order.created_at,
            createdAt: order.created_at,
            createdBy: "customer",
          },
        ],
        shippingMethod: {
          code: order.shipment.method_code ?? "",
          name: order.shipment.method_name ?? "",
          shipmentId: "-",
        },
        fees: {
          subtotal: order.subtotal_exc_tax,
          discount: 0,
          tax: order.tax,
          shippingFee: order.shipping,
          insuranceFee: 0,
          otherFee: 0,
          total: toTwoDecimals(order.subtotal_exc_tax + order.tax),
        },
        timelines: {
          createdAt: order.created_at,
          createdBy: "customer",
          paidAt: order.created_at,
          paidBy: "customer",
          updatedAt: getNow(),
          updatedBy: "auto process",
        },
      });
    }
  }

  return [];
};
