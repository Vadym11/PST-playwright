import { APIRequestContext, APIResponse } from '@playwright/test';
import { apiBaseURL, checkTokenExpiry } from '@utils/test-utils';

export class APIHandler {
  private readonly request: APIRequestContext;
  private readonly adminEmail: string;
  private readonly adminPassword: string;
  private adminToken: string | null = null;

  constructor(request: APIRequestContext) {
    this.request = request;
    this.adminEmail = process.env.EMAIL!;
    this.adminPassword = process.env.PASSWORD_!;
  }

  private adminTokens = new Set<string>();

  async authenticateAsAdmin() {
    const response = await this.request.post(`${apiBaseURL}/users/login`, {
      data: { email: this.adminEmail, password: this.adminPassword },
    });

    if (!response.ok()) {
      throw new Error(
        `APIHandler Authentication Failed: ${response.status()} ${await response.text()}`,
      );
    }
    const body = await response.json();
    const freshToken: string = body.access_token;

    this.adminToken = freshToken;
    this.adminTokens.add(freshToken);

    console.log('APIHandler: Admin authenticated successfully.');

    return freshToken;
  }

  // Long-lived worker-scoped admin tokens can expire mid-run. Only retry when the
  // rejected token is this instance's own cached admin token - never for caller-supplied
  // user tokens, and the token is about to expire.
  private async withAdminRetry(
    token: string | undefined,
    sendRequest: (token?: string) => Promise<APIResponse>,
  ): Promise<APIResponse> {
    if (token !== undefined && this.adminTokens.has(token) && checkTokenExpiry(token)) {
      console.log('APIHandler: Admin token missing or about to expire, re-authenticating...');
      const freshToken = await this.authenticateAsAdmin();
      this.adminToken = freshToken;
      return sendRequest(freshToken);
    }

    return sendRequest(token);
  }

  async post<T>(endpoint: string, data: object, token?: string, headers: object = {}): Promise<T> {
    const response = await this.withAdminRetry(token, (t) =>
      this.request.post(`${apiBaseURL}${endpoint}`, {
        data: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`,
          ...headers,
        },
      }),
    );

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`POST ${endpoint} failed (${response.status()}): ${errorBody}`);
    }

    return (await response.json()) as T;
  }

  async update<T>(
    endpoint: string,
    data: object,
    token?: string,
    headers: object = {},
  ): Promise<T> {
    const response = await this.withAdminRetry(token, (t) =>
      this.request.put(`${apiBaseURL}${endpoint}`, {
        data: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`,
          ...headers,
        },
      }),
    );

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`PUT ${endpoint} failed (${response.status()}): ${errorBody}`);
    }

    return (await response.json()) as T;
  }

  async patch<T>(endpoint: string, data: object, token?: string, headers: object = {}): Promise<T> {
    const response = await this.withAdminRetry(token, (t) =>
      this.request.patch(`${apiBaseURL}${endpoint}`, {
        data: data,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`,
          ...headers,
        },
      }),
    );

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`PATCH ${endpoint} failed (${response.status()}): ${errorBody}`);
    }

    return (await response.json()) as T;
  }

  async get<T>(endpoint: string, token?: string, params: object = {}): Promise<T> {
    const response = await this.withAdminRetry(token, (t) =>
      this.request.get(`${apiBaseURL}${endpoint}`, {
        params: { ...params },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`,
        },
      }),
    );

    if (!response.ok()) {
      const errorBody = await response.text();
      throw new Error(`GET ${endpoint} failed (${response.status()}): ${errorBody}`);
    }

    return response.json() as T;
  }

  async delete<T>(
    endpoint: string,
    token: string,
    params: object = {},
    headers: object = {},
  ): Promise<T> {
    const response = await this.withAdminRetry(token, (t) =>
      this.request.delete(`${apiBaseURL}${endpoint}`, {
        params: { ...params },
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${t}`,
          ...headers,
        },
      }),
    );

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
      await this.authenticateAsAdmin();
    }

    return this.adminToken!;
  }
}
