import { APIHandler } from '../utils/apiHandler';
import {
  LoginResponse,
  LogOutResponse,
  PaginatedResponse,
  SuccessResponse,
} from '../lib/models/api-responses';
import { GetAllUsersResponse, GetCurrentUserResponse, User } from '../lib/models/api-user';

export class UserAPI {
  // We keep them separate: ProductAPI uses the APIHandler
  private readonly apiHandler: APIHandler;
  constructor(apiHandler: APIHandler) {
    this.apiHandler = apiHandler;
  }

  async register(userData: User): Promise<GetAllUsersResponse> {
    const registeredUser = await this.apiHandler.post<GetAllUsersResponse>(
      '/users/register',
      userData,
    );

    return registeredUser;
  }

  async update(userData: User, userToken: string, userId: string): Promise<SuccessResponse> {
    const response = await this.apiHandler.update<SuccessResponse>(`/users/${userId}`, userData, {
      Authorization: `Bearer ${userToken}`,
    });

    return response;
  }

  async patch(
    userData: Partial<User>,
    userToken: string,
    userId: string,
  ): Promise<SuccessResponse> {
    const response = await this.apiHandler.patch<SuccessResponse>(`/users/${userId}`, userData, {
      Authorization: `Bearer ${userToken}`,
    });

    return response;
  }

  async login(email: string, password: string): Promise<LoginResponse> {
    const data = { email, password };

    const responseBody = await this.apiHandler.post<LoginResponse>('/users/login', data);

    return responseBody;
  }

  async logOut(token: string): Promise<LogOutResponse> {
    const responseBody = await this.apiHandler.get<LogOutResponse>(
      '/users/logout',
      {},
      { Authorization: `Bearer ${token}` },
    );

    return responseBody;
  }

  async getCurrentUserData(token: string): Promise<GetCurrentUserResponse> {
    const responseBody = await this.apiHandler.get<GetCurrentUserResponse>(
      '/users/me',
      {},
      { Authorization: `Bearer ${token}` },
    );

    return responseBody;
  }

  async deleteUser(userID: string): Promise<number> {
    const responseStatus = await this.apiHandler.delete<number>(`/users/${userID}`);

    return responseStatus;
  }

  async getUserByEmail(email: string): Promise<GetAllUsersResponse> {
    const response = await this.apiHandler.get<PaginatedResponse<GetAllUsersResponse>>(
      `/users/search`,
      {
        q: email,
      },
    );

    if (!response.data || response.data.length === 0) {
      throw new Error(`API Error: No user found for email: ${email}`);
    }

    return response.data[0];
  }

  async getUserIdByEmail(email: string): Promise<string> {
    const user = await this.getUserByEmail(email);

    return user.id;
  }

  async forgotPassword(email: string): Promise<SuccessResponse> {
    const data = { email };

    const responseBody = await this.apiHandler.post<SuccessResponse>(
      '/users/forgot-password',
      data,
      {
        Authorization: '',
      },
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
      {
        Authorization: `Bearer ${token}`,
      },
    );

    return responseBody;
  }

  async getAll(): Promise<PaginatedResponse<GetAllUsersResponse>> {
    const responseBody =
      await this.apiHandler.get<PaginatedResponse<GetAllUsersResponse>>('/users');

    return responseBody;
  }

  async refreshToken(currentToken: string): Promise<LoginResponse> {
    const responseBody = await this.apiHandler.get<LoginResponse>(
      '/users/refresh',
      {},
      {
        Authorization: `Bearer ${currentToken}`,
      },
    );

    return responseBody;
  }
}
