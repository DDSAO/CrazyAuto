import { keyBy, omit } from "lodash";
import { ProductCollection } from "../../../db";
import {
  RawMagentoProduct,
  RawMagentoProductWithPrices,
} from "../../../interfaces/magento/product";
import { getSeq } from "../../utils";
import { getClassname } from "./_getClassname";

export const saveProducts = async (
  products: RawMagentoProduct[],
  productsWithPrices: RawMagentoProductWithPrices[]
) => {
  let productsPricesDict = keyBy(productsWithPrices, "id");

  for (const product of products) {
    let matchedProductWithPrices = productsPricesDict[product.id];
    let className = getClassname(product.product_kind, product.product_type);

    if (matchedProductWithPrices) {
      await ProductCollection.updateOne(
        {
          id: parseInt(product.id),
        },
        {
          $set: {
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
              Retailer: matchedProductWithPrices.price
                ? parseFloat(matchedProductWithPrices.price)
                : null,
              Gold: matchedProductWithPrices?.group_price["1"]?.price
                ? parseFloat(matchedProductWithPrices.group_price["1"].price)
                : null,
              Platinum: matchedProductWithPrices?.group_price["4"]?.price
                ? parseFloat(matchedProductWithPrices.group_price["4"].price)
                : null,
              Diamond: matchedProductWithPrices?.group_price["5"]?.price
                ? parseFloat(matchedProductWithPrices.group_price["5"].price)
                : null,
              Black: matchedProductWithPrices?.group_price["7"]?.price
                ? parseFloat(matchedProductWithPrices.group_price["7"].price)
                : null,
            },
          },
        },
        {
          upsert: true,
        }
      );
    } else {
      await ProductCollection.updateOne(
        {
          id: parseInt(product.id),
        },
        {
          $set: {
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
          },
        },
        {
          upsert: true,
        }
      );
    }
  }
};
