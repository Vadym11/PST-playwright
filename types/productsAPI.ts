// export interface Products {
//     current_page: number;
//     data:         Product[];
//     from:         number;
//     last_page:    number;
//     per_page:     number;
//     to:           number;
//     total:        number;
// }

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  is_location_offer: boolean;
  is_rental: boolean;
  co2_rating: string;
  in_stock: boolean;
  is_eco_friendly: boolean;
  product_image: ProductImage;
  category: Category;
  brand: Brand;
}

export interface Brand {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface ProductImage {
  id: string;
  by_name: string;
  by_url: string;
  source_name: string;
  source_url: string;
  file_name: string;
  title: string;
}
