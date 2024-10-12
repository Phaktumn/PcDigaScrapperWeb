
export class ProductPrice {
  currentPrice!: number;
  originalPrice!: number;
  priceDifference!: number;
  isOnDiscount!: Boolean;
  discountPercentage!: number;
  date!: string;
  updatedAt!: String;
  createdAt!: String;
}

export class BaseSampleProduct {
  scrappedValue!: SampleProduct;
  sellerName!: string;
}

export class SampleProduct {
  currentPrice!: number;
  originalPrice!: number;
  priceDifference!: number;
  name!: string;
  ean!: string;
  image!: string;
  sku!: string;
  available!: boolean;
  options!: any;
}
