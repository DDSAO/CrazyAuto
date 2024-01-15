import { ProductCollection } from "../../db";
import { Product } from "../../interfaces/product";
import { getNow, getSeq, sendGetRequest } from "../utils";
import { keyBy, omit } from "lodash";

export const _fetchProducts = async (startPage: number, endPage: number) => {
  let products: any[] = [];

  for (let i = startPage; i < endPage; i++) {
    try {
      let res = await sendGetRequest(
        `/product/list?page_no=${i}&page_size=50&&from=0&to=${getNow()}`
      );
      products = products.concat(res.products);
    } catch (e) {}
  }

  let parsedProducts: Product[] = products.map((product) => {
    let className = "unclassified";

    if (product.product_kind) {
      if (product.product_kind === "accessory") {
        className = "accessory";
      } else if (product.product_kind === "phone") {
        className = "phone";
      } else if (product.product_kind === "part") {
        className = "parts";
      } else if (product.product_kind === "Part") {
        className = "parts";
      } else {
        if (
          product.product_type === "Tools" ||
          product.product_type === "Test Cables"
        )
          className = "unclassified";
      }
    }
    return {
      ...omit(product, ["czp_id"]),
      id: product.czp_id ? product.czp_id : 0,
      prestaId: product.id ? product.id : null,
      magentoId: product.czp_id ? product.czp_id : null,
      name: product.name,
      sku: product.sku,
      product_kind: product.product_kind,
      product_type: product.product_type,
      created_at: parseInt(product.created_at),
      updated_at: parseInt(product.updated_at),
      class: className,
      upc: product.upc ? String(product.upc).trim() : null,
      quality: product.quality,
      prices: {
        Retailer: null,
        Gold: null,
        Platinum: null,
        Diamond: null,
        Black: null,
      },
    };
  });

  let existedItems = await ProductCollection.find({
    prestaId: {
      $in: parsedProducts
        .filter((product) => product.prestaId)
        .map((product) => product.prestaId),
    },
  }).toArray();
  let existedItemsDict = keyBy(existedItems, "prestaId");

  for (const parsedProduct of parsedProducts) {
    if (parsedProduct.id) {
      //items on both magento and presta
      await ProductCollection.updateOne(
        {
          id: parsedProduct.id,
        },
        {
          $set: {
            ...omit(parsedProduct, ["id", "prices"]),
          },
        },
        {
          upsert: true,
        }
      );
    } else {
      //items only on presta
      if (parsedProduct.prestaId && existedItemsDict[parsedProduct.prestaId]) {
        //new items, but already saved, DONT reset id or prices
        await ProductCollection.updateOne(
          {
            id: existedItemsDict[parsedProduct.prestaId].id,
          },
          {
            $set: {
              ...omit(parsedProduct, ["id", "prices"]),
            },
          },
          {
            upsert: true,
          }
        );
      } else {
        //new items, never saved
        let serialId = await getSeq("product", 50000);
        await ProductCollection.insertOne({
          ...omit(parsedProduct, ["id"]),
          id: serialId,
        });
      }
    }
  }

  return [];
};
