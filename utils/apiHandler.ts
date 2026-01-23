import { APIRequestContext } from '@playwright/test';
import { getAPIBaseUrl } from '../utils/test-utils';

export class APIHandler {
  private readonly request: APIRequestContext;
  private readonly adminEmail: string;
  private readonly adminPassword: string;
  private adminToken: string | null = null;
  private apiBaseURL = getAPIBaseUrl();

  constructor(request: APIRequestContext) {
    this.request = request;
    this.adminEmail = process.env.EMAIL!;
    this.adminPassword = process.env.PASSWORD_!;
  }

  async authenticate() {
    const response = await this.request.post(`${this.apiBaseURL}/users/login`, {
      data: { email: this.adminEmail, password: this.adminPassword },
    });
    const body = await response.json();

    if (!response.ok()) {
      throw new Error(
        `APIHandler Authentication Failed: ${response.status()} ${await response.text()}`,
      );
    }

    this.adminToken = body.access_token;

    console.log('APIHandler: Admin authenticated successfully.');
  }

  // private async ensureAuthenticated() {
  //   if (!this.adminToken) await this.authenticate();
  // }

  async post<T>(url: string, data: object, headers: object = {}): Promise<T> {
    const response = await this.request.post(url, {
      data: data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.adminToken}`,
        ...headers,
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`POST ${url} failed (${response.status()}): ${errorBody}`);
    }

    return (await response.json()) as T;
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

  async get<T>(url: string, params: object = {}, headers: object = {}): Promise<T> {
    // await this.ensureAuthenticated();

    const response = await this.request.get(url, {
      params: { ...params },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.adminToken}`,
        ...headers,
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`GET ${url} failed (${response.status()}): ${errorBody}`);
    }

    return response.json() as T;
  }

  async delete<T>(url: string, params: object = {}, headers: object = {}): Promise<T> {
    const response = await this.request.delete(url, {
      params: { ...params },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.adminToken}`,
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
