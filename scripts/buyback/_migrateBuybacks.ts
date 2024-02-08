import { keyBy } from "lodash";
import { v4 } from "uuid";
import { BuybackCollection, BuybackItemCollection } from "../../db";
import { getClient } from "../../db/postgres";
import { BuybackInfo } from "../../interfaces/buyback";
import { getNow, toTimestamp, toTwoDecimals } from "../../jobs/utils";

const getBuybackGrandTotal = (buyback: BuybackInfo) => {
  return toTwoDecimals(
    buyback.items.reduce(
      (sum, item) =>
        sum +
        (item.aQty ?? 0) * (item.priceA ?? 0) +
        (item.bQty ?? 0) * (item.priceB ?? 0) +
        (item.cQty ?? 0) * (item.priceC ?? 0) +
        (item.dQty ?? 0) * (item.priceD ?? 0),
      0
    ) +
      buyback.adjustments.reduce(
        (sum, adjustment) => sum + adjustment.amount,
        0
      )
  );
};

export const migrateBuybacks = async () => {
  let client = await getClient();

  let buybackItems = await BuybackItemCollection.find({}).toArray();
  let itemsDict = keyBy(buybackItems, "item_id");
  let itemsEntityIdMapping: any = {};
  for (const item of buybackItems) {
    let response = await client.query(
      `
      INSERT INTO buybacks.buyback_item_model (
        name,
        brand,
        category,
        sort,
        upc_a,
        upc_b,
        upc_c,
        upc_d,
        upc_u
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING entity_id
    `,
      [
        item.name,
        "",
        item.category,
        item.sort ?? 0,
        item.upc.a,
        item.upc.b,
        item.upc.c,
        item.upc.d,
        "",
      ]
    );

    itemsEntityIdMapping[item.item_id] = response.rows[0].entity_id;
  }

  let buybacks = await BuybackCollection.find({
    paidAt: { $gt: 0 },
  }).toArray();

  let count = 0;

  for (const buyback of buybacks) {
    console.log(++count, buybacks.length);
    let subtotal = toTwoDecimals(
      buyback.items.reduce((sum, item) => {
        return (
          sum +
          toTwoDecimals((item.aQty ?? 0) * (item.priceA ?? 0)) +
          toTwoDecimals((item.bQty ?? 0) * (item.priceB ?? 0)) +
          toTwoDecimals((item.cQty ?? 0) * (item.priceC ?? 0)) +
          toTwoDecimals((item.dQty ?? 0) * (item.priceD ?? 0))
        );
      }, 0)
    );
    let diamond_bonus = toTwoDecimals(
      buyback.adjustments.find((adjustment) => {
        return adjustment.title === "Diamond & Above";
      })?.amount ?? 0
    );
    let shipping_fee = toTwoDecimals(
      buyback.adjustments.find((adjustment) => {
        return adjustment.title.match(/post fee/gi);
      })?.amount ?? 0
    );
    let grand_total = getBuybackGrandTotal(buyback);
    let other_adjustment = toTwoDecimals(
      grand_total - subtotal - shipping_fee - diamond_bonus
    );

    let response = await client.query(
      `
      INSERT INTO buybacks.buyback (
        customer_platform_id,
        customer_platform,
        buyback_platform_id,
        buyback_platform,
        num,
        token,
        status,
        email,
        phone,
        report_url,

        address_line_1,
        address_line_2,
        city,
        state,
        postcode,
        tracking_no,
        payment_method,
        dispose_method,
        created_at,
        created_by,
        recieved_at,

        recieved_by,
        tested_at,
        tested_by,
        confirmed_at,
        confirmed_by,
        paid_at,
        paid_by,
        updated_at,
        updated_by,
        subtotal,

        diamond_bonus,
        shipping_fee,
        other_adjustment,
        other_adjustment_note,
        total
      ) 
      SELECT 
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 
        $11, $12, $13, $14, $15, $16, $17, $18, $19, $20,
        $21, $22, $23, $24, $25, $26, $27, $28, $29, $30,
        $31, $32, $33, $34, $35, $36
      WHERE NOT EXISTS (
        SELECT 1 FROM buybacks.buyback WHERE customer_platform = $2 AND buyback_platform_id = $3
      )
      RETURNING entity_id
    `,
      [
        buyback.customer_id,
        "magento",
        buyback.id,
        "magento",
        buyback.num,
        buyback.token ?? v4(),
        buyback.status,
        buyback.email,
        buyback.phone,
        null,
        buyback.customerConfirmAddress
          ? buyback.customerConfirmAddress.address_line1
          : buyback.address_line ?? "",

        buyback.customerConfirmAddress
          ? buyback.customerConfirmAddress.address_line2
          : "",
        buyback.customerConfirmAddress
          ? buyback.customerConfirmAddress.city
          : buyback.city ?? "",
        buyback.customerConfirmAddress
          ? buyback.customerConfirmAddress.state
          : buyback.state ?? "",
        buyback.customerConfirmAddress
          ? buyback.customerConfirmAddress.postcode
          : buyback.postcode ?? "",
        buyback.tracking_no,
        buyback.paymentType ?? buyback.customerConfirmBanking
          ? "bank_transfer"
          : "credit",
        buyback.disposeType?.match("post_back")
          ? "post_back"
          : buyback.disposeType ?? "destroy",
        buyback.fetchedAt,
        buyback.fetchBy,
        buyback.recievedAt,

        buyback.recieveBy,
        buyback.testedAt,
        buyback.testBy,
        buyback.confirmedAt,
        buyback.confirmBy,
        buyback.paidAt,
        buyback.payBy,
        getNow(),
        "migration",
        subtotal,

        diamond_bonus,
        shipping_fee,
        other_adjustment,
        "migration",
        grand_total,
      ]
    );
    if (response.rowCount === 0) continue;

    let buybackEntityId = response.rows[0].entity_id;

    for (const item of buyback.items) {
      await client.query(
        `
      INSERT INTO buybacks.buyback_item (
        buyback_id,
        model_id,
        qty_a,
        qty_b,
        qty_c,
        qty_d,
        qty_u,
        price_a,
        price_b,
        price_c,
        price_d,
        price_u,
        subtotal,
        note
      ) 
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14);
    `,
        [
          buybackEntityId,
          itemsEntityIdMapping[item.item_id],
          item.aQty ?? 0,
          item.bQty ?? 0,
          item.cQty ?? 0,
          item.dQty ?? 0,
          item.unqualifiedQty ?? 0,
          item.priceA ?? 0,
          item.priceB ?? 0,
          item.priceC ?? 0,
          item.priceD ?? 0,
          item.priceUnqualified ?? 0,
          toTwoDecimals(
            (item.aQty ?? 0) * (item.priceA ?? 0) +
              (item.bQty ?? 0) * (item.priceB ?? 0) +
              (item.cQty ?? 0) * (item.priceC ?? 0) +
              (item.dQty ?? 0) * (item.priceD ?? 0) +
              (item.unqualifiedQty ?? 0) * (item.priceUnqualified ?? 0)
          ),
          item.note,
        ]
      );
    }

    for (const history of buyback.history) {
      let [dateStr, content] = history.split("=>");
      let ts: number | null = toTimestamp(
        new Date(dateStr.replace(/[\|[\]]/gi, "")).getTime()
      );

      if (isNaN(ts)) {
        ts = null;
      }

      await client.query(
        `
      INSERT INTO buybacks.buyback_history (
        buyback_id,
        content,
        created_at
      ) 
      VALUES ($1, $2, $3)
    `,
        [buybackEntityId, content.trim(), ts]
      );
    }
  }

  // let buybacks = await BuybackCollection.find({}).toArray();
  // let i = 0;
};
