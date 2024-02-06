import { CustomerCollection } from "../../../db";
import { TongtoolOrder } from "../../../interfaces/tongtoolOrder";
import { sendSMS } from "../../smsSender";

export const notifyPickup = async (tongtoolOrder: TongtoolOrder) => {
  let customer = await CustomerCollection.findOne({
    id: tongtoolOrder.buyerAccountId,
  });

  let text = `Order #${tongtoolOrder.salesRecordNumber} is ready for Pick Up ${
    tongtoolOrder.warehouseName === "澳洲悉尼仓库"
      ? "at Sydney Warehouse (19-21 Euston Street Rydalmere, NSW 2116)"
      : tongtoolOrder.warehouseName === "澳洲墨尔本仓库"
      ? "at Melbourne Warehouse (8 Expo Court Mount Waverly,VIC 3149)"
      : ""
  }. ${
    customer
      ? `Opt out SMS subscription: https://czpofficeapp.com/customer/unsubscribe/${customer.token}`
      : ""
  } `;

  if (tongtoolOrder.buyerPhone)
    await sendSMS({
      phone: tongtoolOrder.buyerPhone,
      text,
      customer_id: tongtoolOrder.buyerAccountId,
      type: "PICKUP_NOTIFICATION",
    });
};
