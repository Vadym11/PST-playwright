import { test as base } from '@playwright/test';
import { generateRandomuserDataFaker, getAPIBaseUrl } from '@utils/test-utils';
import { APIHandler } from '@utils/apiHandler';
import { PaginatedResponse } from '@models/api-responses';
import { GetAllUsersResponse } from '@models/api-user';
import { ProductAPI } from '@api-models/product';
import { UserAPI } from '@api-models/user';
const apiBaseURL = getAPIBaseUrl();

type ApiFixtures = {
  adminToken: string;
  baseAPIUrl: string;
  getAllUsers: GetAllUsersResponse[];
  newUserRegistered: GetAllUsersResponse;
  apiHandler: APIHandler;
};

type ApiWorkerFixtures = {
  workerApiHandler: APIHandler;
};

type WorkerAPIFixtures = {
  productApi: ProductAPI;
  userApi: UserAPI;
};

type CombinedWorkerFixtures = ApiWorkerFixtures & WorkerAPIFixtures;

const test = base.extend<ApiFixtures, CombinedWorkerFixtures>({
  adminToken: async ({ workerApiHandler }, use) => {
    await use(await workerApiHandler.getToken());
  },

  baseAPIUrl: async ({}, use) => {
    const baseAPIUrl = getAPIBaseUrl();

    await use(baseAPIUrl);
  },

  getAllUsers: async ({ apiHandler, baseAPIUrl }, use) => {
    const apiURL = `${baseAPIUrl}/users`;

    const response = await apiHandler.get<PaginatedResponse<GetAllUsersResponse>>(apiURL);

    await use(response.data);
  },

  newUserRegistered: async ({ apiHandler, baseAPIUrl }, use) => {
    const apiURL = `${baseAPIUrl}/users/register`;
    const user = generateRandomuserDataFaker();

    const registeredUser = await apiHandler.post<GetAllUsersResponse>(apiURL, user);

    console.log(`User with email ${registeredUser.email} has been registered via API Fixture.`);

    await use(registeredUser);
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

  userApi: [
    async ({ workerApiHandler }, use) => {
      const api = new UserAPI(workerApiHandler);
      await use(api);
    },
    { scope: 'worker' },
  ],
});

export { test };
