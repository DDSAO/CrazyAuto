import { v4 } from "uuid";
import {
  BuybackCollection,
  BuybackItemCollection,
  BuybackPriceSourceCollection,
  CustomerCollection,
} from "../../db";
import { getClient } from "../../db/postgres";
import { keyBy } from "lodash";
import { toTimestamp, toTwoDecimals } from "../../jobs/utils";
import { BuybackInfo } from "../../interfaces/buyback";

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
      SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9
        WHERE NOT EXISTS (
          SELECT 1 FROM buybacks.buyback_item_model WHERE name = $1
        )
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

  console.log(itemsEntityIdMapping);

  let buybacks = await BuybackCollection.find({
    paidAt: { $gt: 0 },
  }).toArray();

  for (const buyback of buybacks) {
    let response = await client.query(`
      INSERT INTO buybacks.buyback_price_board (
        title,
        created_at,
        created_by
      ) 
      VALUES ("Buyback #${buyback.id} Price Board", ${buyback.created_at}, "migration")
      RETURNING entity_id
    `);
    let priceboardId = response.rows[0].entity_id;

    response = await client.query(`
      INSERT INTO buybacks.buyback (
        price_board_id,
        customer_platform_id,
        customer_platform,
        buyback_platform_id,
        num,
        token,
        status,
        email,
        phone,
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
      ) 
      VALUES (${priceboardId}, ${buyback.customer_id}, "magento", ${
      buyback.id
    }, ${buyback.num}, ${buyback.token ?? v4()}, ${buyback.status}, ${
      buyback.email
    }, ${buyback.phone}, ${
      buyback.customerConfirmAddress
        ? buyback.customerConfirmAddress.address_line1
        : buyback.address_line ?? ""
    }, ${
      buyback.customerConfirmAddress
        ? buyback.customerConfirmAddress.address_line2
        : ""
    }, ${
      buyback.customerConfirmAddress
        ? buyback.customerConfirmAddress.city
        : buyback.city ?? ""
    }, ${
      buyback.customerConfirmAddress
        ? buyback.customerConfirmAddress.state
        : buyback.state ?? ""
    }, ${
      buyback.customerConfirmAddress
        ? buyback.customerConfirmAddress.postcode
        : buyback.postcode ?? ""
    }, ${buyback.tracking_no}, ${
      buyback.paymentType ?? buyback.customerConfirmBanking
        ? "bank_transfer"
        : "credit"
    }, ${
      buyback.disposeType?.match("post_back")
        ? "post_back"
        : buyback.disposeType ?? "destroy"
    }, ${buyback.fetchedAt}, ${buyback.fetchBy}, ${buyback.recievedAt}, ${
      buyback.recieveBy
    }, ${buyback.testedAt}, ${buyback.testBy}, ${buyback.confirmedAt}, ${
      buyback.confirmBy
    }. ${buyback.paidAt}, ${buyback.payBy}, ${buyback.updatedAt}, ${
      buyback.updateBy
    })
      RETURNING entity_id
    `);
    let buybackEntityId = response.rows[0].entity_id;

    for (const item of buyback.items) {
      let response = await client.query(`
      INSERT INTO buybacks.buyback_item (
        buyback_id,
        model_id,
        qty_a,
        qty_b,
        qty_c,
        qty_d,
        qty_u
      ) 
      VALUES (${buybackEntityId}, ${itemsEntityIdMapping[item.item_id]}, ${
        item.aQty ?? 0
      },${item.bQty ?? 0},${item.cQty ?? 0}, ${item.dQty ?? 0},${
        item.unqualifiedQty ?? 0
      });
      INSERT INTO buybacks.buyback_price_board_item (
        price_board_id,
        model_id,
        price_a,
        price_b,
        price_c,
        price_d,
        price_u,
      ) 
      VALUES (${buybackEntityId}, ${itemsEntityIdMapping[item.item_id]}, ${
        item.priceA ?? 0
      },${item.priceB ?? 0},${item.priceC ?? 0}, ${item.priceD ?? 0},${
        item.priceUnqualified ?? 0
      });

      
    `);
    }

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
    let diamond_bonus =
      buyback.adjustments.find((adjustment) => {
        return adjustment.title === "Diamond & Above";
      })?.amount ?? 0;
    let shipping_fee =
      buyback.adjustments.find((adjustment) => {
        return adjustment.title.match(/post fee/gi);
      })?.amount ?? 0;
    let grand_total = getBuybackGrandTotal(buyback);
    let other_adjustment = toTwoDecimals(
      grand_total - shipping_fee - diamond_bonus
    );
    response = await client.query(`
      INSERT INTO buybacks.buyback_payment (
        buyback_id,
        subtotal,
        diamond_bonus,
        shipping_fee,
        other_adjustment,
        other_adjustment_note,
        total,
        created_at,
        created_by,
        paid_at,
        paid_by
      ) 
      VALUES (${buybackEntityId}, ${subtotal}, ${diamond_bonus}, ${shipping_fee}, ${other_adjustment}, "migration", ${grand_total}, ${buyback.confirmedAt}, ${buyback.confirmBy}, ${buyback.paidAt}, ${buyback.payBy} )
    `);

    for (const history of buyback.history) {
      let [ts, content] = history.split("=>");
      await client.query(`
      INSERT INTO buybacks.buyback_history (
        buyback_id,
        content,
        created_at
      ) 
      VALUES (${buybackEntityId}, ${content.trim()}, ${toTimestamp(
        new Date(ts.replace(/[\|[\]]/gi, "")).getTime()
      )})
    `);
    }
  }

  // let buybacks = await BuybackCollection.find({}).toArray();
  // let i = 0;
};
