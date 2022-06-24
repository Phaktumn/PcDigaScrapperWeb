import { ProductPrice } from "./ProductPrice";

export class Product {
  ean!: String;
  name!: String;
  url!: String;
  image!: String;
  prices!: [ProductPrice];
  updatedAt!: String;
  createdAt!: String;
}
