import { keyBy } from "lodash";
import { v4 } from "uuid";
import { CustomerCollection } from "../../../db";
import { RawMagentoCustomer } from "../../../interfaces/magento/customer";
import { getNow } from "../../utils";
export const saveCustomers = async (rawCustomers: RawMagentoCustomer[]) => {
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
      await CustomerCollection.insertOne({
        id: parseInt(rawCustomer.id),
        token: v4(),
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
  }
};
