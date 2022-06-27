import { Seller } from "./Seller";

export class Product {
  name!: String;
  sku!: String;
  image!: String;
  sellers!: Seller[];
  updatedAt!: String;
  createdAt!: String;
}


