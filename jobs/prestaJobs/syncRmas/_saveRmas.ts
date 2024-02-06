import { keyBy } from "lodash";
import { CustomerCollection, RmaCollection } from "../../../db";
import { RawRmaInfo } from "../../../interfaces/rma";
import { v4 } from "uuid";

export const saveRmas = async (rmas: RawRmaInfo[]) => {
  let originRmas = await RmaCollection.find({
    id: { $in: rmas.map((rma) => rma.id) },
  }).toArray();
  let originRmasDict = keyBy(originRmas, "id");

  let customers = await CustomerCollection.find({
    prestaId: { $in: rmas.map((rma) => rma.customer_id) },
  }).toArray();
  let customersDict = keyBy(customers, "id");

  for (const rma of rmas) {
    let matchedRma = originRmasDict[rma.id];
    let matchedCustomer = customersDict[rma.customer_id];

    if (matchedRma) {
      await RmaCollection.updateOne(
        { id: rma.id },
        {
          $set: {
            tracking_number: rma.tracking_number ?? "",
          },
        }
      );
    } else {
      await RmaCollection.insertOne({
        ...rma,
        token: v4(),
        id: rma.id,
        customer_id: matchedCustomer?.id ?? null,
        created_at: rma.created_at,
        updated_at: rma.updated_at,
        customer_group: matchedCustomer?.group_name ?? null,
        returnItems: [],
        items: rma.items.map((item) => ({
          ...item,
          qty: parseInt(item.qty),
        })),
        tracking_number: rma.tracking_number ?? "",
      });
    }
  }
};
