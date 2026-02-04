import { APIHandler } from '../utils/apiHandler';
import { GetProductResponse, Product } from '../lib/models/api-product';
import { PaginatedResponse, SuccessResponse } from '../lib/models/api-responses';

export class ProductAPI {
  // We keep them separate: ProductAPI uses the APIHandler
  private readonly apiHandler: APIHandler;
  constructor(apiHandler: APIHandler) {
    this.apiHandler = apiHandler;
  }

  async create(productData: Product): Promise<GetProductResponse> {
    const responseBody = await this.apiHandler.post<GetProductResponse>('/products', productData);

    return responseBody;
  }

  async update(productData: Product, productID: string): Promise<SuccessResponse> {
    const responseBody = await this.apiHandler.update<SuccessResponse>(
      `/products/${productID}`,
      productData,
    );

    return responseBody;
  }

  async patch(productData: Partial<Product>, productID: string): Promise<SuccessResponse> {
    const responseBody = await this.apiHandler.patch<SuccessResponse>(
      `/products/${productID}`,
      productData,
    );

    return responseBody;
  }

  async getAll(): Promise<PaginatedResponse<GetProductResponse>> {
    const responseBody =
      await this.apiHandler.get<PaginatedResponse<GetProductResponse>>('/products');

    return responseBody;
  }

  async getById(productID: string): Promise<GetProductResponse> {
    const responseBody = await this.apiHandler.get<GetProductResponse>(`/products/${productID}`);

    return responseBody;
  }

  async getRelatedProductsById(productID: string): Promise<GetProductResponse[]> {
    const responseBody = await this.apiHandler.get<GetProductResponse[]>(
      `/products/${productID}/related`,
    );

    return responseBody;
  }

  async searchByName(productName: string): Promise<PaginatedResponse<GetProductResponse>> {
    const params = { q: productName };
    const responseBody = await this.apiHandler.get<PaginatedResponse<GetProductResponse>>(
      `/products/search`,
      params,
    );

    return responseBody;
  }

  async deleteById(productID: string): Promise<number> {
    return await this.apiHandler.delete<number>(`/products/${productID}`);
  }
}
