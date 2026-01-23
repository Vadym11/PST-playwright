import { APIRequestContext, APIResponse } from '@playwright/test';
import { getAPIBaseUrl } from '../utils/test-utils';

export class APIHandler {
  private readonly request: APIRequestContext;
  private readonly adminEmail: string;
  private readonly adminPassword: string;
  private apiBaseURL = getAPIBaseUrl();

  constructor(request: APIRequestContext) {
    this.request = request;
    this.adminEmail = process.env.EMAIL!;
    this.adminPassword = process.env.PASSWORD_!;
  }

  async post<T>(url: string, token: string, data: object, headers: object = {}): Promise<T> {
    const response = await this.request.post(url, {
      'data': data,
      'headers': {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...headers,
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`POST ${url} failed (${response.status()}): ${errorBody}`);
    }

    return await response.json() as T;
  }

  // private async getAdminToken(): Promise<string> {
  //   const payload = {
  //     email: this.adminEmail,
  //     password: this.adminPassword,
  //   };

  //   console.log(`${this.apiBaseURL}/users/login`);

  //   const response = this.post(`${this.apiBaseURL}/users/login`, payload);

  //   const token = await response.then((data) => data.access_token);

  //   return token;
  // }

  async get<T>(url: string, adminToken: string, params: object = {}, headers: object = {}): Promise<T> {
    const response = await this.request.get(url, {
      params: { ...params },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
        ...headers,
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`GET ${url} failed (${response.status()}): ${errorBody}`);
    }

    return response.json() as T;
  }

  async delete<T>(url: string, adminToken: string, params: object = {}, headers: object = {}): Promise<T> {
    const response = await this.request.delete(url, {
      params: { ...params },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`,
        ...headers,
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`DELETE ${url} failed (${response.status()}): ${errorBody}`);
    }

    if (response.status() === 204) {
      return response.status() as T;
    }

    return response.json() as T;
  }
}
