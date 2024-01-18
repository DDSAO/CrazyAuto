import { sendGetRequest } from "../utils";

interface OrderStatus {
  id: number;
  status: string;
  order_number: string;
  created_at: number;
  updated_at: number;
}

export const getOrderStatusByIds = async (
  ids: number[]
): Promise<{ rmas: OrderStatus[] }> => {
  return await sendGetRequest(`/order/statusByIds?ids=${ids.join(",")}`);
};
