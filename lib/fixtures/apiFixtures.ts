import { test as base } from '@playwright/test';
import { apiBaseURL } from '@utils/test-utils';
import { APIHandler } from '@utils/apiHandler';
import { ProductAPI } from '@api-models/product';
import { UserAPI } from '@api-models/user';

type ApiFixtures = {
  apiHandler: APIHandler;
  adminToken: string;
  productApi: ProductAPI;
  userApi: UserAPI;
};

type WorkerAPIFixtures = {
  apiHandlerWorker: APIHandler;
  userApiWorker: UserAPI;
  baseAPIUrl: string;
};

const test = base.extend<ApiFixtures, WorkerAPIFixtures>({
  apiHandler: async ({ request }, use) => {
    const handler = new APIHandler(request);

    await use(handler);
  },

  adminToken: async ({ apiHandler }, use) => {
    await use(await apiHandler.authenticateAsAdmin());
  },

  userApi: async ({ apiHandler }, use) => {
    use(new UserAPI(apiHandler));
  },

  productApi: async ({ apiHandler }, use) => {
    use(new ProductAPI(apiHandler));
  },

  apiHandlerWorker: [
    async ({ playwright }, use) => {
      const request = await playwright.request.newContext({
        baseURL: apiBaseURL,
      });
      const handler = new APIHandler(request);

      await use(handler);
    },
    { scope: 'worker' },
  ],

  userApiWorker: [
    async ({ apiHandlerWorker }, use) => {
      use(new UserAPI(apiHandlerWorker));
    },
    { scope: 'worker' },
  ],

  baseAPIUrl: [
    async ({}, use) => {
      await use(apiBaseURL!);
    },
    { scope: 'worker' },
  ],
});

export { test };
