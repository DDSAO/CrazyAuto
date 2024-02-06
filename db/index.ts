import { MongoClient } from "mongodb";
import { Product, TongtoolProduct } from "../interfaces/product";
import { SMSMessage, Sequence } from "../interfaces/system";
import { NextOrder, Order, OrderRefundRow } from "../interfaces/order";
import { Customer } from "../interfaces/customer";
import { RepairJob } from "../interfaces/repair";
import { TongtoolOrder } from "../interfaces/tongtoolOrder";
import { RmaInfo } from "../interfaces/rma";
import { User } from "../interfaces/user";
import { BuybackInfo, BuybackItem } from "../interfaces/buyback";
import {
  BuybackItemModel,
  BuybackPriceSource,
} from "../interfaces/magento/buyback";

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
  .collection<TongtoolProduct>("TongtoolProductCollection");

export const OrderRefundRowCollection = client
  .db("CrazyApp")
  .collection<OrderRefundRow>("OrderRefundRowCollection");
export const NextOrderCollection = client
  .db("CrazyApp")
  .collection<NextOrder>("NextOrderCollection");
export const OrderCollection = client
  .db("CrazyApp")
  .collection<Order>("OrderCollection");
export const TongtoolOrderCollection = client
  .db("CrazyApp")
  .collection<TongtoolOrder>("TongtoolOrderCollection");

export const CustomerCollection = client
  .db("CrazyApp")
  .collection<Customer>("CustomerCollection");

export const RepairJobCollection = client
  .db("CrazyApp")
  .collection<RepairJob>("RepairJobCollection");

export const RmaCollection = client
  .db("CrazyApp")
  .collection<RmaInfo>("RmaCollection");

export const UserCollection = client
  .db("CrazyApp")
  .collection<User>("UserCollection");

export const BuybackCollection = client
  .db("CrazyPhone")
  .collection<BuybackInfo>("Buyback");

export const BuybackItemCollection = client
  .db("CrazyPhone")
  .collection<BuybackItemModel>("BuybackItemCollection");

export const BuybackPriceSourceCollection = client
  .db("CrazyPhone")
  .collection<BuybackPriceSource>("BuybackPriceSourceCollection");
