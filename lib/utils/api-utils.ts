import { APIHandler } from '@utils/apiHandler';
import { GetCurrentUserResponse, GetAllUsersResponse } from '@models/api-user';
import { CreateUser } from '@models/api-user';
import { GetProductResponse, Product } from '@models/api-product';
import {
  LoginResponse,
  LogOutResponse,
  PaginatedResponse,
  SuccessResponse,
} from '@models/api-responses';
import { GetBrand } from '@models/api-brand';
import { GetCategoriesResponse, GetCategoryResponse } from '@models/api-category';
import { ProductImage } from '@models/api-product-image';

export async function registerUserAPI(
  apiHandler: APIHandler,
  userData: CreateUser,
): Promise<GetAllUsersResponse> {
  const registeredUser = await apiHandler.post<GetAllUsersResponse>('/users/register', userData);

  return registeredUser;
}

export async function loginAPI(
  apiHandler: APIHandler,
  email: string,
  password: string,
): Promise<LoginResponse> {
  const data = { email, password };

  const responseBody = await apiHandler.post<LoginResponse>('/users/login', data);

  return responseBody;
}

export async function loginUserAPI(
  apiHandler: APIHandler,
  email: string,
  password: string,
): Promise<LoginResponse> {
  const data = { email, password };

  const responseBody = await apiHandler.post<LoginResponse>('/users/login', data, {
    Authorization: '',
  });

  return responseBody;
}

export async function getCurrentUserData(
  apiHandler: APIHandler,
  token: string,
): Promise<GetCurrentUserResponse> {
  const responseBody = await apiHandler.get<GetCurrentUserResponse>(
    '/users/me',
    {},
    { Authorization: `Bearer ${token}` },
  );

  return responseBody;
}

export async function logOutUserAPI(
  apiHandler: APIHandler,
  token: string,
): Promise<LogOutResponse> {
  const responseBody = await apiHandler.get<LogOutResponse>(
    '/users/logout',
    {},
    { Authorization: `Bearer ${token}` },
  );

  return responseBody;
}

export async function deleteUserAPI(apiHandler: APIHandler, userID: string): Promise<number> {
  const responseStatus = await apiHandler.delete<number>(`/users/${userID}`);

  return responseStatus;
}

export async function getUserByIdAPI(
  apiHandler: APIHandler,
  userID: string,
): Promise<GetAllUsersResponse> {
  const response = await apiHandler.get<GetAllUsersResponse>(`/users/${userID}`);

  return response;
}

export async function getUserByEmailAPI(
  apiHandler: APIHandler,
  email: string,
): Promise<GetAllUsersResponse> {
  const response = await apiHandler.get<PaginatedResponse<GetAllUsersResponse>>(`/users/search`, {
    q: email,
  });

  if (!response.data || response.data.length === 0) {
    throw new Error(`API Error: No user found for email: ${email}`);
  }

  return response.data[0];
}

export async function getUserIdByEmailAPI(apiHandler: APIHandler, email: string): Promise<string> {
  const user = await getUserByEmailAPI(apiHandler, email);

  return user.id;
}

export async function forgotPasswordAPI(
  apiHandler: APIHandler,
  email: string,
): Promise<SuccessResponse> {
  const data = { email };

  const responseBody = await apiHandler.post<SuccessResponse>('/users/forgot-password', data, {
    Authorization: '',
  });

  return responseBody;
}

export async function createProductAPI(
  apiHandler: APIHandler,
  productData: Product,
): Promise<GetProductResponse> {
  const responseBody = await apiHandler.post<GetProductResponse>('/products', productData);

  return responseBody;
}

export async function getAllProductsAPI(
  apiHandler: APIHandler,
): Promise<PaginatedResponse<GetProductResponse>> {
  const responseBody = await apiHandler.get<PaginatedResponse<GetProductResponse>>('/products');

  return responseBody;
}

export async function getProductByIdAPI(
  apiHandler: APIHandler,
  productID: string,
): Promise<GetProductResponse> {
  const responseBody = await apiHandler.get<GetProductResponse>(`/products/${productID}`);

  return responseBody;
}

export async function deleteProductByIdAPI(
  apiHandler: APIHandler,
  productID: string,
): Promise<number> {
  const responseStatus = await apiHandler.delete<number>(`/products/${productID}`);

  return responseStatus;
}

export async function getAllBrandsAPI(apiHandler: APIHandler): Promise<GetBrand[]> {
  const responseBody = await apiHandler.get<GetBrand[]>('/brands');

  return responseBody;
}

export async function getBrandByIdAPI(apiHandler: APIHandler, brandID: string): Promise<GetBrand> {
  const responseBody = await apiHandler.get<GetBrand>(`/brands/${brandID}`);

  return responseBody;
}

export async function deleteBrandByIdAPI(apiHandler: APIHandler, brandID: string): Promise<number> {
  const responseStatus = await apiHandler.delete<number>(`/brands/${brandID}`);

  return responseStatus;
}

export async function getAllCategoriesAPI(
  apiHandler: APIHandler,
): Promise<GetCategoriesResponse[]> {
  const responseBody = await apiHandler.get<GetCategoriesResponse[]>('/categories');

  return responseBody;
}

export async function getCategoryByIdAPI(
  apiHandler: APIHandler,
  categoryID: string,
): Promise<GetCategoryResponse> {
  const responseBody = await apiHandler.get<GetCategoryResponse>(`/categories/tree/${categoryID}`);

  return responseBody;
}

export async function getAllImagesAPI(apiHandler: APIHandler): Promise<ProductImage[]> {
  const responseBody = await apiHandler.get<ProductImage[]>('/images');

  return responseBody;
}
