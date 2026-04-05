import { CreateUser } from '@models/api-user';
import { test as baseTest } from '@fixtures/apiFixtures';
import {
  deleteFile,
  generateRandomuserDataFaker,
  prefillStorageStateFile,
} from '@utils/test-utils';

type TestScopedFixtures = {
  userState: { storageStatePath: string; userData: CreateUser };
};

type WorkerScopedFixtures = {
  workerUserSession: CreateUser;
};

// first argument is for test scope fixtures, second - for worker scope fixtures
const test = baseTest.extend<TestScopedFixtures, WorkerScopedFixtures>({
  userState: async ({ userApi }, use) => {
    const workerId = `${test.info().title.replaceAll(' ', '-')}_${test.info().testId}`;
    const user = generateRandomuserDataFaker();
    // const user = await registerRandomUser(apiHandler);
    const userId = (await userApi.register(user)).id;
    const loginResponse = await userApi.login(user.email, user.password);
    const token = loginResponse.access_token;

    const dir = 'playwright/.auth';
    const statePath = `${dir}/user-state-${workerId}.json`;

    //since the user data is passed with the fixture,
    // we don't need to save and then read the data file
    // const userDataPath = `${dir}/user-data-${workerId}.json`;
    // await writeFile(userDataPath, user);

    await prefillStorageStateFile(token, statePath);

    await use({ storageStatePath: statePath, userData: user });

    // Teardown: Clean up storage state and user data files after the worker finishes
    await deleteFile(statePath);

    // Teardown: Delete the user created for the test session
    // await userApi.deleteUser(userId, adminToken);
  },

  storageState: async ({ userState }, use) => {
    await use(userState.storageStatePath);
  },

  workerUserSession: [
    async ({ userApiWorker, adminTokenWorker }, use) => {
      const user = generateRandomuserDataFaker();
      const userId = (await userApiWorker.register(user)).id;

      await use(user);

      // Teardown: Delete the user created for the worker session
      await userApiWorker.deleteUser(userId, adminTokenWorker);
    },
    { scope: 'worker' },
  ],

  // since using worker scoped storageState creates a risk of collision
  // in tests that mutate user state, it is safer to use test scoped fixture
  // or use the worker scoped fixture that does not rely on storageState file,
  // but instead passes the user data directly to the tests
  // since using worker scoped storageState creates a risk of collision
  // in tests that mutate user state, it is safer to use test scoped fixture
  // or use the worker scoped fixture that does not rely on storageState file,
  // but instead passes the user data directly to the tests
  // This is test scope (default) and can now safely depend on a worker fixture
  // storageState: async ({ workerUserSession }, use) => {
  // await use(workerUserSession.storageStatePath);
  // },
});

export { test };
