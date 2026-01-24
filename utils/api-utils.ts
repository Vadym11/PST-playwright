import { APIHandler } from '../utils/apiHandler';
import { CurrentUser, UserAPI } from '../types/usersAPI';
import { User } from '../types/user';
import {
  LoginResponse,
  LogOutResponse,
  PaginatedResponse,
  ResponseSuccess,
} from '../types/api-responses';

export async function registerUserAPI(apiHandler: APIHandler, userData: User): Promise<UserAPI> {
  const registeredUser = await apiHandler.post<UserAPI>('/users/register', userData);

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
): Promise<CurrentUser> {
  const responseBody = await apiHandler.get<CurrentUser>(
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

export async function getUserByIdAPI(apiHandler: APIHandler, userID: string): Promise<UserAPI> {
  const response = await apiHandler.get<UserAPI>(`/users/${userID}`);

  return response;
}

export async function getUserByEmailAPI(apiHandler: APIHandler, email: string): Promise<UserAPI> {
  const response = await apiHandler.get<PaginatedResponse<UserAPI>>(`/users/search`, { q: email });

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
): Promise<ResponseSuccess> {
  const data = { email };

  const responseBody = await apiHandler.post<ResponseSuccess>('/users/forgot-password', data, {
    Authorization: '',
  });

  return responseBody;
}
