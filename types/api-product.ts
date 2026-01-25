import { GetBrand } from './api-brand';
import { ProductImage } from './api-product-image';

export interface BaseProduct {
  name: string;
  description: string;
  price: number;
  is_location_offer: number;
  is_rental: number;
  co2_rating: string;
}

export interface Product extends BaseProduct {
  category_id: string;
  brand_id: string;
  product_image_id: string;
}

export interface GetProductResponse extends BaseProduct {
  id: string;
  is_eco_friendly: number;
  brand: GetBrand;
  category: Category;
  product_image: ProductImage;
}

export interface Category {
  id: string;
  parent_id: string;
  name: string;
  slug: string;
  sub_categories: string[];
}
