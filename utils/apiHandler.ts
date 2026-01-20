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

  async post(url: string, payload: object, headers: object = {}): Promise<any> {
    const response = await this.request.post(url, {
      data: payload,
      headers: {
        'Content-Type': 'application/json',
        ...headers,
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`POST ${url} failed (${response.status()}): ${errorBody}`);
    }

    return await response.json();
  }

  private async getAdminToken(): Promise<string> {
    const payload = {
      email: this.adminEmail,
      password: this.adminPassword,
    };

    console.log(`${this.apiBaseURL}/users/login`);

    const response = this.post(`${this.apiBaseURL}/users/login`, payload);

    const token = await response.then((data) => data.access_token);

    return token;
  }

  async get<T>(url: string, params: object = {}, headers: object = {}): Promise<T> {
    const adminToken = await this.getAdminToken();

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
}
