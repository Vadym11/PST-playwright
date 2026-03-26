import { test as base } from '@playwright/test';
import {
  authFilePath,
  generateRandomuserDataFaker,
  getAPIBaseUrl,
  prefillStorageStateFile,
  registerRandomUser,
} from '@utils/test-utils';
import { APIHandler } from '@utils/apiHandler';
import { PaginatedResponse } from '@models/api-responses';
import { CreateUser, GetAllUsersResponse } from '@models/api-user';
import { ProductAPI } from '@api-models/product';
import { UserAPI } from '@api-models/user';
const apiBaseURL = getAPIBaseUrl();

type ApiFixtures = {
  adminToken: string;
  getAllUsers: GetAllUsersResponse[];
  apiHandler: APIHandler;
  testUserApi: UserAPI;
  createdUser: CreateUser & { id: string };
};

type WorkerAPIFixtures = {
  workerApiHandler: APIHandler;
  productApi: ProductAPI;
  adminUserApi: UserAPI;
  userApi: UserAPI;
  newUserRegistered: CreateUser & { id: string };
  baseAPIUrl: string;
  workerStorageState: string;
};

const test = base.extend<ApiFixtures, WorkerAPIFixtures>({
  adminToken: async ({ workerApiHandler }, use) => {
    await use(await workerApiHandler.getToken());
  },

  baseAPIUrl: [
    async ({}, use) => {
      const baseAPIUrl = getAPIBaseUrl();

      await use(baseAPIUrl);
    },
    { scope: 'worker' },
  ],

  getAllUsers: async ({ apiHandler }, use) => {
    const response = await apiHandler.get<PaginatedResponse<GetAllUsersResponse>>('/users');

    await use(response.data);
  },

  newUserRegistered: [
    async ({ adminUserApi }, use) => {
      const user: CreateUser = generateRandomuserDataFaker();

      const registeredUser = await adminUserApi.register(user);

      console.log(`User with email ${registeredUser.email} has been registered via API Fixture.`);

      await use({ ...user, id: registeredUser.id });
    },
    { scope: 'worker' },
  ],

  createdUser: async ({ testUserApi }, use) => {
    const user: CreateUser = generateRandomuserDataFaker();
    const registeredUser = await testUserApi.register(user);

    await use({ ...user, id: registeredUser.id });

    try {
      await testUserApi.deleteUser(registeredUser.id);
    } catch (error) {
      console.warn(`Cleanup failed for user ${registeredUser.id}:`, error);
    }
  },

  apiHandler: async ({ request }, use) => {
    // This 'request' is fresh for every test
    const handler = new APIHandler(request);
    await handler.authenticate();

    await use(handler);
  },

  workerApiHandler: [
    async ({ playwright }, use) => {
      const requestContext = await playwright.request.newContext({ baseURL: apiBaseURL });
      const handler = new APIHandler(requestContext);
      await handler.authenticate();

      await use(handler);

      await requestContext.dispose();
    },
    { scope: 'worker' },
  ],

  productApi: [
    async ({ workerApiHandler }, use) => {
      const api = new ProductAPI(workerApiHandler);
      await use(api);
    },
    { scope: 'worker' },
  ],

  adminUserApi: [
    async ({ workerApiHandler }, use) => {
      const api = new UserAPI(workerApiHandler);
      await use(api);
    },
    { scope: 'worker' },
  ],

  testUserApi: async ({ apiHandler }, use) => {
    const api = new UserAPI(apiHandler);
    await use(api);
  },

  // Backward-compatible alias. Prefer `adminUserApi` for explicit intent.
  userApi: [
    async ({ adminUserApi }, use) => {
      await use(adminUserApi);
    },
    { scope: 'worker' },
  ],
});

export { test };
