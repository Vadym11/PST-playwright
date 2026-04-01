import { CreateUser } from '@models/api-user';
import { test as baseTest } from '@fixtures/apiFixtures';
import {
  deleteFile,
  prefillStorageStateFile,
  registerRandomUser,
  writeFile,
} from '@utils/test-utils';

type NewUserWorkerFixtures = {
  workerUserSession: { storageStatePath: string; userData: CreateUser };
};

// first argument is for test scope fixtures, second - for worker scope fixtures
const test = baseTest.extend<object, NewUserWorkerFixtures>({
  workerUserSession: [
    async ({ apiHandlerWorker, userApiWorker }, use) => {
      const workerId = test.info().parallelIndex;
      const user = await registerRandomUser(apiHandlerWorker);
      const loginResponse = await userApiWorker.login(user.email, user.password);
      const token = loginResponse.access_token;

      const dir = 'playwright/.auth';
      const statePath = `${dir}/user-${workerId}.json`;
      const userDataPath = `${dir}/user-data-${workerId}.json`;

      await prefillStorageStateFile(token, statePath);

      await writeFile(userDataPath, user);

      await use({ storageStatePath: statePath, userData: user });

      // Teardown: Clean up storage state and user data files after the worker finishes
      await deleteFile(statePath);
      await deleteFile(userDataPath);
    },
    { scope: 'worker' },
  ],

  // This is test scope (default) and can now safely depend on a worker fixture
  storageState: async ({ workerUserSession }, use) => {
    await use(workerUserSession.storageStatePath);
  },
});

export { test };
