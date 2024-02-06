import { v4 } from "uuid";
import { CustomerCollection } from "../../db";
import { getClient } from "../../db/postgres";

export const migrateCustomers = async () => {
  let client = await getClient();
  let customers = await CustomerCollection.find({}).toArray();
  let i = 0;
  for (const customer of customers) {
    console.log(i++, customers.length);
    let response = await client.query(
      `
      WITH customer AS (
        INSERT INTO customers.customer (
          email,
          firstname,
          lastname,
          business_approve_status,
          phone,
          level,
          business_name,
          abn,
          token,
          created_at,
          created_by,
          updated_at,
          updated_by
        ) 
        SELECT $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13
          WHERE NOT EXISTS (
            SELECT 1 FROM customers.customer WHERE email = $1
          )
        RETURNING entity_id
      ) 
      INSERT INTO customers.customer_platform (
        customer_id,
        platform,
        platform_id,
        created_at,
        created_by
      ) 
      SELECT customer.entity_id, 'magento', $14, $10, $11
      FROM customer
      ON CONFLICT DO NOTHING
      `,
      [
        customer.email,
        customer.firstname,
        customer.lastname,
        customer.business_approve_status,
        customer.phone,
        customer.group_name,
        customer.business_name,
        customer.abn,
        customer.token ?? v4(),
        customer.createdAt,
        "magento",
        customer.lastSyncAt,
        "magento",
        customer.id,
      ]
    );
  }
};
