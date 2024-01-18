import { keyBy } from "lodash";
import {
  CustomerCollection,
  NextOrderCollection,
  OrderCollection,
  ProductCollection,
} from "../../db";
import { RawPrestaOrder } from "../../interfaces/order";
import { getNow, getSeq, toTwoDecimals } from "../utils";

export const saveOrders = async (orders: RawPrestaOrder[]) => {
  let productSet = new Set<number>(),
    customerSet = new Set<number>();
  for (const order of orders) {
    customerSet.add(order.customer_id);
    for (const line of order.lines) {
      productSet.add(line.item_id);
    }
  }

  let originNextOrders = await NextOrderCollection.find({
    platform: "presta",
    platformId: {
      $in: orders.map((order: any) => order.id),
    },
  });

  let originNextOrdersDict = keyBy(originNextOrders, "id");

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

  //save in next order
  for (const order of orders) {
    let nextCustomer = customersDict[order.customer_id] || null;
    let originNextOrder = originNextOrdersDict[order.id];

    if (originNextOrder) {
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
                productKind: line.product_kind, //we can use default product_kind
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
              id: productsDict[line.item_id]?.id,
              upc: productsDict[line.item_id]?.upc ?? "",
              class: productsDict[line.item_id]?.class ?? "unclassified",
              product_kind: line.product_kind ?? "", //we can use default product_kind
              product_type: productsDict[line.item_id]?.product_type ?? "",
              discount_amount: 0,
            };
          }),
          order_date: order.order_date,
          created_at: order.created_at,
          updated_at: order.updated_at,
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
