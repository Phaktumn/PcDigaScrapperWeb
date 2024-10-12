import { Seller } from "./Seller";

export class Product {
  _id!: string;
  name!: String;
  sku!: String;
  image!: String;
  sellers!: Seller[];
  updatedAt!: String;
  createdAt!: String;
}