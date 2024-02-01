import { keyBy } from "lodash";
import { CustomerCollection } from "../../db";
import { Customer, RawPrestaCustomer } from "../../interfaces/customer";
import { getNow, getSeq } from "../utils";
import { v4 } from "uuid";
export const saveCustomers = async (rawCustomers: RawPrestaCustomer[]) => {
  let existingCustomers = await CustomerCollection.find({
    email: {
      $in: rawCustomers.map((customer) => customer.email),
    },
  }).toArray();
  let existingCustomersDict = keyBy(existingCustomers, "email");

  for (const rawCustomer of rawCustomers) {
    let matchedCustomer = existingCustomersDict[rawCustomer.email];
    if (matchedCustomer) {
      await CustomerCollection.updateOne(
        {
          id: matchedCustomer.id,
        },
        {
          $set: {
            firstname: rawCustomer.firstname,
            lastname: rawCustomer.lastname,
            email: rawCustomer.email,
            phone: rawCustomer.phone,
            group_id: rawCustomer.group_id,
            group_name: rawCustomer.group_name,
            account_manager_id: rawCustomer.account_manager_id,
            account_manager_name: rawCustomer.account_manager_name,
            lastSyncAt: getNow(),
            address: rawCustomer.address,
            business_name: rawCustomer.business_name,
            abn: rawCustomer.abn,
            createdAt: rawCustomer.created_at,
            prestaId: rawCustomer.id,
          },
        }
      );
    } else {
      let serialId = await getSeq("customer", 30000);
      await CustomerCollection.insertOne({
        id: serialId,
        token: v4(),
        firstname: rawCustomer.firstname,
        lastname: rawCustomer.lastname,
        email: rawCustomer.email,
        phone: rawCustomer.phone,
        group_id: rawCustomer.group_id,
        group_name: rawCustomer.group_name,
        account_manager_id: rawCustomer.account_manager_id,
        account_manager_name: rawCustomer.account_manager_name,
        lastSyncAt: getNow(),
        address: rawCustomer.address,
        unsubscriptions: [],
        emails: [],
        business_name: rawCustomer.business_name,
        abn: rawCustomer.abn,
        createdAt: rawCustomer.created_at,
        prestaId: rawCustomer.id,
        business_approve_status: rawCustomer.business_approve_status,
      });
    }
  }
};
