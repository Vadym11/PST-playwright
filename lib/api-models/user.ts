import { APIHandler } from '@utils/api-handler';
import {
  LoginResponse,
  LogOutResponse,
  PaginatedResponse,
  SuccessResponse,
} from '@models/api-responses';
import { GetAllUsersResponse, GetCurrentUserResponse, CreateUser } from '@models/api-user';

export class UserAPI {
  // We keep them separate: ProductAPI uses the APIHandler
  private readonly apiHandler: APIHandler;
  constructor(apiHandler: APIHandler) {
    this.apiHandler = apiHandler;
  }

  async register(userData: CreateUser): Promise<GetAllUsersResponse> {
    const registeredUser = await this.apiHandler.post<GetAllUsersResponse>(
      '/users/register',
      userData,
    );

    return registeredUser;
  }

  async update(userData: CreateUser, userToken: string, userId: string): Promise<SuccessResponse> {
    const response = await this.apiHandler.update<SuccessResponse>(
      `/users/${userId}`,
      userData,
      userToken,
    );

    return response;
  }

  async patch(
    userData: Partial<CreateUser>,
    userToken: string,
    userId: string,
  ): Promise<SuccessResponse> {
    const response = await this.apiHandler.patch<SuccessResponse>(
      `/users/${userId}`,
      userData,
      userToken,
    );

    return response;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const data = { email, password };

    const responseBody = await this.apiHandler.post<LoginResponse>('/users/login', data);

    return responseBody;
  }

  async getToken(email: string, password: string): Promise<string> {
    const loginResponse = await this.login(email, password);

    return loginResponse.access_token;
  }

  async logOut(token: string): Promise<LogOutResponse> {
    const responseBody = await this.apiHandler.get<LogOutResponse>('/users/logout', token);

    return responseBody;
  }

  async getCurrentUserData(userToken: string): Promise<GetCurrentUserResponse> {
    const responseBody = await this.apiHandler.get<GetCurrentUserResponse>('/users/me', userToken);

    return responseBody;
  }

  async deleteUser(userID: string, adminToken: string): Promise<number> {
    const responseStatus = await this.apiHandler.delete<number>(`/users/${userID}`, adminToken);

    return responseStatus;
  }

  async getUserByEmail(email: string, token: string): Promise<GetAllUsersResponse> {
    const response = await this.apiHandler.get<PaginatedResponse<GetAllUsersResponse>>(
      `/users/search`,
      token,
      {
        q: email,
      },
    );

    if (!response.data || response.data.length === 0) {
      throw new Error(`API Error: No user found for email: ${email}`);
    }

    return response.data[0];
  }

  async getUserIdByEmail(email: string, token: string): Promise<string> {
    const user = await this.getUserByEmail(email, token);

    return user.id;
  }

  async forgotPassword(email: string): Promise<SuccessResponse> {
    const data = { email };

    const responseBody = await this.apiHandler.post<SuccessResponse>(
      '/users/forgot-password',
      data,
    );

    return responseBody;
  }

  async changePassword(
    token: string,
    currentPassword: string,
    newPassword: string,
  ): Promise<SuccessResponse> {
    const data = {
      current_password: currentPassword,
      new_password: newPassword,
      new_password_confirmation: newPassword,
    };

    const responseBody = await this.apiHandler.post<SuccessResponse>(
      '/users/change-password',
      data,
      token,
    );

    return responseBody;
  }

  async getAll(token: string): Promise<PaginatedResponse<GetAllUsersResponse>> {
    const responseBody = await this.apiHandler.get<PaginatedResponse<GetAllUsersResponse>>(
      '/users',
      token,
    );

    return responseBody;
  }

  async refreshToken(currentToken: string): Promise<LoginResponse> {
    const responseBody = await this.apiHandler.get<LoginResponse>('/users/refresh', currentToken);

    return responseBody;
  }
}
