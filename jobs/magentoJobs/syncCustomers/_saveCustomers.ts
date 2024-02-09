import { keyBy } from "lodash";
import { v4 } from "uuid";
import { CustomerCollection } from "../../../db";
import { RawMagentoCustomer } from "../../../interfaces/magento/customer";
import { getNow } from "../../utils";
import { getClient } from "../../../db/postgres";
export const saveCustomers = async (rawCustomers: RawMagentoCustomer[]) => {
  let client = await getClient();

  let existingCustomers = await CustomerCollection.find({
    id: {
      $in: rawCustomers.map((customer) => parseInt(customer.id)),
    },
  }).toArray();
  let existingCustomersDict = keyBy(existingCustomers, "email");

  for (const rawCustomer of rawCustomers) {
    let matchedCustomer = existingCustomersDict[rawCustomer.email];
    if (matchedCustomer) {
      await CustomerCollection.updateOne(
        {
          id: parseInt(rawCustomer.id),
        },
        {
          $set: {
            firstname: rawCustomer.firstname,
            lastname: rawCustomer.lastname,
            email: rawCustomer.email,
            phone: rawCustomer.phone,
            group_id: parseInt(rawCustomer.group_id),
            group_name: rawCustomer.group_name,
            account_manager_id: rawCustomer.account_manager_id
              ? parseInt(rawCustomer.account_manager_id)
              : null,
            account_manager_name: rawCustomer.account_manager_name,
            lastSyncAt: getNow(),
            address: rawCustomer.address,
            business_name: rawCustomer.business_name,
            abn: rawCustomer.abn,
            createdAt: parseInt(rawCustomer.created_at),
            updatedAt: parseInt(rawCustomer.updated_at),
            business_approve_status: rawCustomer.business_approve_status,
          },
        }
      );
    } else {
      let token = v4();
      await CustomerCollection.insertOne({
        id: parseInt(rawCustomer.id),
        token,
        firstname: rawCustomer.firstname,
        lastname: rawCustomer.lastname,
        email: rawCustomer.email,
        phone: rawCustomer.phone,
        group_id: parseInt(rawCustomer.group_id),
        group_name: rawCustomer.group_name,
        account_manager_id: rawCustomer.account_manager_id
          ? parseInt(rawCustomer.account_manager_id)
          : null,
        account_manager_name: rawCustomer.account_manager_name,
        lastSyncAt: getNow(),
        address: rawCustomer.address,
        business_name: rawCustomer.business_name,
        abn: rawCustomer.abn,
        createdAt: parseInt(rawCustomer.created_at),
        updatedAt: parseInt(rawCustomer.updated_at),
        business_approve_status: rawCustomer.business_approve_status,
      });
    }

    await client.query(
      `
    WITH upsert as (
      UPDATE customers.customer customer
      SET 
        email = $2,
        firstname = $3,
        lastname = $4,
        business_approve_status = $5,
        phone = $6,
        level = $7,
        business_name = $8,
        abn = $9,
        updated_at = $13,
        updated_by = $14
      FROM customers.customer_platform platform
      WHERE 
        customer.entity_id = platform.customer_id AND 
        platform.platform = 'magento' AND
        platform.platform_id = $1
      RETURNING *
    ), insert_customer as (
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
      SELECT $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14
      WHERE NOT EXISTS (SELECT * FROM upsert)
      RETURNING *
    )  
    INSERT INTO customers.customer_platform (
      customer_id,
      platform_id,
      platform,
      created_at,
      created_by
    ) 
    SELECT insert_customer.entity_id,  $1, 'magento', $11, 'magento'
    FROM insert_customer
    WHERE EXISTS (SELECT * FROM insert_customer)`,
      [
        parseInt(rawCustomer.id),
        rawCustomer.email,
        rawCustomer.firstname,
        rawCustomer.lastname,
        rawCustomer.business_approve_status,
        rawCustomer.phone,
        rawCustomer.group_name,
        rawCustomer.business_name,
        rawCustomer.abn,
        v4(),

        parseInt(rawCustomer.created_at),
        "magento",
        getNow(),
        "magento",
      ]
    );
  }

  await client.end();
};
