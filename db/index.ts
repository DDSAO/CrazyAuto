import { MongoClient } from "mongodb";
import { Product } from "../interfaces/product";
import { SMSMessage, Sequence } from "../interfaces/system";
import { NextOrder, OrderRefundRow } from "../interfaces/order";
import { Customer } from "../interfaces/customer";

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

export const OrderRefundRowCollection = client
  .db("CrazyApp")
  .collection<OrderRefundRow>("OrderRefundRowCollection");
export const NextOrderCollection = client
  .db("CrazyApp")
  .collection<NextOrder>("NextOrderCollection");

export const CustomerCollection = client
  .db("CrazyApp")
  .collection<Customer>("CustomerCollection");
