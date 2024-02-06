import { keyBy, omit } from "lodash";
import { ProductCollection, TongtoolProductCollection } from "../../../db";
import {
  RawTongtoolProduct,
  TongtoolProduct,
} from "../../../interfaces/product";
import { toTwoDecimals } from "../../utils";

export const saveTongtoolProducts = async (
  productType: number,
  products: RawTongtoolProduct[]
) => {
  let parsedProducts: TongtoolProduct[] = [];

  for (const product of products) {
    if (productType === 0 || productType === 1) {
      if (product.goodsDetail) {
        for (const good of product.goodsDetail) {
          parsedProducts.push({
            ...product,
            ...good,
            itemId: null,
            productType: productType,
          });
        }
      }
    } else if (productType === 3) {
      if (product.goodsDetail) {
        parsedProducts.push({
          ...product,
          goodsSku: product.sku,
          goodsAveCost: toTwoDecimals(
            product.goodsDetail.reduce(
              (sum, detail) => sum + detail.goodsAveCost,
              0
            )
          ),
          goodsCurCost: toTwoDecimals(
            product.goodsDetail.reduce(
              (sum, detail) => sum + detail.goodsCurCost,
              0
            )
          ),
          goodsWeight: toTwoDecimals(
            product.goodsDetail.reduce(
              (sum, detail) => sum + detail.goodsWeight,
              0
            )
          ),
          productType: productType,
          itemId: null,
        });
      }
    }
  }

  let originProducts = await ProductCollection.find(
    {
      upc: {
        $in: parsedProducts.map((good) => good.goodsSku),
      },
    },
    {
      projection: {
        id: 1,
        upc: 1,
        _id: 0,
      },
    }
  ).toArray();
  let originProductsDict = keyBy(originProducts, "upc");

  parsedProducts = parsedProducts.map((parsedProduct) => {
    let matchedProduct = originProductsDict[parsedProduct.goodsSku];
    return { ...parsedProduct, itemId: matchedProduct?.id ?? null };
  });

  if (parsedProducts.length > 0)
    await TongtoolProductCollection.insertMany([...parsedProducts]);
};
