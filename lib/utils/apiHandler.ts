import { APIRequestContext } from '@playwright/test';
import { getAPIBaseUrl } from '@utils/test-utils';

export class APIHandler {
  private readonly request: APIRequestContext;
  private readonly adminEmail: string;
  private readonly adminPassword: string;
  private adminToken: string | null = null;
  readonly apiBaseURL = getAPIBaseUrl();

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

  async post<T>(endpoint: string, data: object, headers: object = {}): Promise<T> {
    const response = await this.request.post(`${this.apiBaseURL}${endpoint}`, {
      data: data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.adminToken}`,
        ...headers,
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`POST ${endpoint} failed (${response.status()}): ${errorBody}`);
    }

    return (await response.json()) as T;
  }

  async update<T>(endpoint: string, data: object, headers: object = {}): Promise<T> {
    const response = await this.request.put(`${this.apiBaseURL}${endpoint}`, {
      data: data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.adminToken}`,
        ...headers,
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`PUT ${endpoint} failed (${response.status()}): ${errorBody}`);
    }

    return (await response.json()) as T;
  }

  async patch<T>(endpoint: string, data: object, headers: object = {}): Promise<T> {
    const response = await this.request.patch(`${this.apiBaseURL}${endpoint}`, {
      data: data,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.adminToken}`,
        ...headers,
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`PATCH ${endpoint} failed (${response.status()}): ${errorBody}`);
    }

    return (await response.json()) as T;
  }

  async get<T>(endpoint: string, params: object = {}, headers: object = {}): Promise<T> {
    const response = await this.request.get(`${this.apiBaseURL}${endpoint}`, {
      params: { ...params },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.adminToken}`,
        ...headers,
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`GET ${endpoint} failed (${response.status()}): ${errorBody}`);
    }

    return response.json() as T;
  }

  async delete<T>(endpoint: string, params: object = {}, headers: object = {}): Promise<T> {
    const response = await this.request.delete(`${this.apiBaseURL}${endpoint}`, {
      params: { ...params },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.adminToken}`,
        ...headers,
      },
    });

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`DELETE ${endpoint} failed (${response.status()}): ${errorBody}`);
    }

    if (response.status() === 204) {
      return response.status() as T;
    }

    return response.json() as T;
  }

  async getToken(): Promise<string> {
    if (!this.adminToken) {
      await this.authenticate();
    }

    return this.adminToken!;
  }
}
