import { v4 } from "uuid";
import { CustomerCollection } from "../../db";
import { getClient } from "../../db/postgres";
import { MongoClient } from "mongodb";
import { getNow } from "../../jobs/utils";
import { groupBy, keyBy } from "lodash";

export const migratePhones = async () => {
  let client = await getClient();
  const mongoClient = new MongoClient("mongodb://0.0.0.0:27017");

  let models = await mongoClient
    .db("CrazyApp")
    .collection("PhoneModelCollection")
    .find({})
    .toArray();
  let i = 0;

  let rules = await mongoClient
    .db("CrazyApp")
    .collection("PhoneModelPriceRuleCollection")
    .find({})
    .sort({ serialId: 1 })
    .toArray();
  for (const rule of rules) {
    console.log(i++, rules.length);
    let response = await client.query(
      `
        INSERT INTO phones.phone_price_rule (
          title,
          note,
          a_plus,
          a,
          b_plus,

          b,
          lb,
          d,
          created_at,
          created_by,

          updated_at,
          updated_by
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12
        )
        `,
      [
        rule.title,
        rule.description,
        rule.APlus,
        rule.A,
        rule.BPlus,
        rule.B,
        rule.LB,
        rule.D,
        rule.createdAt,
        rule.createdBy,
        getNow(),
        "migration",
      ]
    );
  }

  i = 0;
  let modelsDict: any = {};
  for (const model of models) {
    console.log(i++, models.length);
    let response = await client.query(
      `
      INSERT INTO phones.phone_model (
        price_rule_id,
        brand,
        model,
        storage,
        sort,
        base_price
      ) VALUES (
        $1, $2, $3, $4, $5, $6
      ) RETURNING *
      `,
      [
        model.ruleId ?? null,
        model.brand,
        model.model,
        model.storage,
        model.serialId,
        model.basePrice,
      ]
    );
  }

  i = 0;
  let phones = await mongoClient
    .db("CrazyApp")
    .collection("PhoneCollection")
    .find({})
    .toArray();
  let phonesByStockDict = groupBy(phones, "stockId");

  let stocks = await mongoClient
    .db("CrazyApp")
    .collection("PhoneStockCollection")
    .find({})
    .toArray();

  for (const stock of stocks) {
    let phones = phonesByStockDict[stock.stockId];
    let response = await client.query(
      `
      INSERT INTO phones.phone_stock (
        title,
        supplier,
        id_by_supplier,
        created_at,
        created_by,

        finalised_at,
        finalised_by,
        currency,
        to_aud,
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9
      ) RETURNING *
      `,
      [
        stock.stockId,
        stock.supplier,
        null,
        stock.createdAt,
        stock.createdBy,
        null,
        null,
        phones[0].purchaseCurrency,
        phones[0].purchaseToAUD,
      ]
    );
    let storedStock = response.rows[0];

    for (const phone of phones) {
      await client.query(
        `
        WITH phone AS (
          INSERT INTO phones.phone (
            stock_id,
            model_id,
            status,
            imei,
            grade,

            color,
            battery,
            note,
            created_at,
            created_by,
            
            updated_at,
            updated_by
          ) 
          SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12
            WHERE NOT EXISTS (
              SELECT 1 FROM customers.customer WHERE email = $1
            )
          RETURNING entity_id
        ) 

        INSERT INTO phones.phone_account_entry (
          stock_id,
          phone_id,

        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9
        )
        `,
        [
          stock.stockId,
          stock.supplier,
          null,
          stock.createdAt,
          stock.createdBy,
          null,
          null,
          phones[0].purchaseCurrency,
          phones[0].purchaseToAUD,
        ]
      );
    }
  }

  return "ok";
};
