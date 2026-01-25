import { test as base } from '@playwright/test';
import { generateRandomuserDataFaker, getAPIBaseUrl } from '../utils/test-utils';
import { APIHandler } from '../utils/apiHandler';
import { PaginatedResponse } from '../types/api-responses';
import { GetAllUsersResponse } from '../types/api-user';

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

const test = base.extend<ApiFixtures, ApiWorkerFixtures>({
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
});

export { test };
