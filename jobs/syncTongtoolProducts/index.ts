import axios from "axios";
import { getTongtoolAppendix, sleep, toTwoDecimals } from "../utils";
import { ProductCollection, TongtoolProductCollection } from "../../db";
import { keyBy, omit } from "lodash";

export const syncTongtoolProducts = async () => {
  for (const productType of [0, 1, 3]) {
    await TongtoolProductCollection.deleteMany({ productType });
    let shouldContinue = true;
    let pageNo = 1;
    while (shouldContinue) {
      let response = await axios.post(
        `${
          process.env.TONGTOOL_DOMAIN
        }/api-service/openapi/tongtool/goodsQuery${getTongtoolAppendix()}`,
        {
          merchantId: "867c7b0416daad473a756d6f0e21e6d7",
          pageSize: "100",
          productType,
          pageNo,
        },
        {
          headers: {
            "Content-Type": "application/json",
            api_version: "3.0",
          },
          timeout: 10000,
        }
      );
      console.log(pageNo, omit(response.data.datas, ["array"]));
      await sleep(12000);

      if (response.data.datas !== null) {
        if (response.data.datas.array.length < 100) {
          shouldContinue = false;
        } else {
          pageNo += 1;
        }
      }

      let goods = [];
      for (const info of response.data.datas.array) {
        if (productType === 0 || productType === 1) {
          if (info.goodsDetail) {
            for (const good of info.goodsDetail) {
              goods.push({
                ...info,
                ...good,
                productType,
              });
            }
          }
        } else if (productType === 3) {
          if (info.goodsDetail) {
            goods.push({
              ...info,
              goodsSku: info.sku,
              goodsAveCost: toTwoDecimals(
                (info.goodsDetail as any[]).reduce(
                  (sum, detail) => sum + detail.goodsAveCost,
                  0
                )
              ),
              goodsCurCost: toTwoDecimals(
                (info.goodsDetail as any[]).reduce(
                  (sum, detail) => sum + detail.goodsCurCost,
                  0
                )
              ),
              goodsWeight: toTwoDecimals(
                (info.goodsDetail as any[]).reduce(
                  (sum, detail) => sum + detail.goodsWeight,
                  0
                )
              ),
              productType,
            });
          }
        } else {
          goods.push({
            ...info,
            goodsSku: null,
            goodsAveCost: null,
            goodsCurCost: null,
            goodsWeight: null,
            productType,
          });
        }
      }

      let products = await ProductCollection.find<{
        upc: string;
        id: number;
      }>(
        {
          upc: {
            $in: goods.map((good) => good.goodsSku),
          },
        },
        { projection: { id: 1, upc: 1, _id: 0 } }
      ).toArray();
      let productsDict = keyBy(products, "upc");

      if (goods.length > 0) {
        await TongtoolProductCollection.insertMany(
          goods.map((good) => {
            return {
              ...good,
              item_id:
                good.goodsSku && productsDict[good.goodsSku]
                  ? productsDict[good.goodsSku].id
                  : null,
            };
          })
        );
      }
    }
  }
};
