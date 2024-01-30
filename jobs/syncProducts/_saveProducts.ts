import { keyBy, omit } from "lodash";
import { Product, RawPrestaProduct } from "../../interfaces/product";
import { ProductCollection } from "../../db";
import { getClassname } from "./_getClassname";
import { getSeq } from "../utils";

export const saveProducts = async (products: RawPrestaProduct[]) => {
  let existedItems = await ProductCollection.find({
    prestaId: {
      $in: products.map((product) => product.id),
    },
  }).toArray();
  let existedItemsDict = keyBy(existedItems, "prestaId");

  for (const product of products) {
    let matchedItem = existedItemsDict[product.id];
    let className = getClassname(product.product_kind, product.product_type);

    if (matchedItem) {
      await ProductCollection.updateOne(
        {
          id: matchedItem.id,
        },
        {
          $set: {
            name: product.name,
            sku: product.sku,
            product_kind: product.product_kind,
            product_type: product.product_type,
            created_at: product.created_at,
            updated_at: product.updated_at,
            class: className,
            upc: product.upc ? String(product.upc).trim() : null,
            quality: product.quality,
            prices: {
              Retailer: product.price ?? null,
              Gold: product.group_price["4"]?.price ?? null,
              Platinum: product.group_price["5"]?.price ?? null,
              Diamond: product.group_price["6"]?.price ?? null,
              Black: product.group_price["7"]?.price ?? null,
            },
          },
        },
        {
          upsert: true,
        }
      );
    } else {
      let serialId = await getSeq("product", 50000);
      await ProductCollection.insertOne({
        ...omit(product, ["czp_id"]),
        id: serialId,
        prestaId: product.id ? product.id : null,
        magentoId: product.czp_id ? product.czp_id : null,
        name: product.name,
        sku: product.sku,
        product_kind: product.product_kind,
        product_type: product.product_type,
        created_at: product.created_at,
        updated_at: product.updated_at,
        class: className,
        upc: product.upc ? String(product.upc).trim() : null,
        quality: product.quality,
        prices: {
          Retailer: product.price,
          Gold: product.group_price["4"].price,
          Platinum: product.group_price["5"].price,
          Diamond: product.group_price["6"].price,
          Black: product.group_price["7"].price,
        },
      });
    }
  }
};
