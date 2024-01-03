import { MongoClient } from "mongodb";
import { Product } from "../interfaces/products";
import { SMSMessage, Sequence } from "../interfaces/system";

export const client = new MongoClient("mongodb://0.0.0.0:27017");

export const ProductCollection = client
  .db("CrazyApp")
  .collection<Product>("ProductCollection");

export const SequenceCollection = client
  .db("CrazyApp")
  .collection<Sequence>("SequenceCollection");
export const SmSCollection = client
  .db("CrazyApp")
  .collection<SMSMessage>("SmSCollection");

export const TongtoolProductCollection = client
  .db("CrazyApp")
  .collection("TongtoolProductCollection");
