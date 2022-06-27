import { ProductPrice } from "./ProductPrice";

export class Seller {
  name!: string;
  url!: string;
  productEan!: string;
  productPrices?: ProductPrice[];
  updatedAt!: string;
  createdAt!: string;
}
