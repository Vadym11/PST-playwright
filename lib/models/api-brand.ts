export interface Brand {
  name: string;
  slug: string;
}

export interface GetBrand extends Brand {
  id: string;
}
