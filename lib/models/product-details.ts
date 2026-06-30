export interface ProductDetails {
  name: string;
  description: string;
  stock: number | null;
  price: number;
  isLocationOffer: boolean;
  isItemForRent: boolean;
  co2Rating: string;
  brand: string;
  category: string;
  image: string;
}
