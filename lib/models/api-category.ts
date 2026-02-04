export interface BaseCategory {
  name: string;
  slug: string;
}

export interface Category extends BaseCategory {
  id: string;
}

export interface GetCategoriesResponse extends BaseCategory {
  id: string;
  parent_id: string;
}

export interface GetCategoryResponse extends GetCategoriesResponse {
  sub_categories: string[];
}
