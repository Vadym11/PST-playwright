import { CreateUser } from '@models/api-user';
import { test as baseTest } from '@fixtures/apiFixtures';
import {
  deleteFile,
  prefillStorageStateFile,
  registerRandomUser,
  writeFile,
} from '@utils/test-utils';

type TestScopedFixtures = {
  userState: { storageStatePath: string; userData: CreateUser };
};

type WorkerScopedFixtures = {
  workerUserSession: { storageStatePath: string; userData: CreateUser };
};

// first argument is for test scope fixtures, second - for worker scope fixtures
const test = baseTest.extend<TestScopedFixtures, WorkerScopedFixtures>({
  userState: async ({ apiHandler, userApi }, use) => {
    const workerId = `${test.info().title.replaceAll(' ', '-')}_${test.info().testId}`;
    const user = await registerRandomUser(apiHandler);
    const loginResponse = await userApi.login(user.email, user.password);
    const token = loginResponse.access_token;

    const dir = 'playwright/.auth';
    const statePath = `${dir}/user-state-${workerId}.json`;
    //since the user data is passed with the fixture,
    // we don't need to save and then read the data file
    // const userDataPath = `${dir}/user-data-${workerId}.json`;

    await prefillStorageStateFile(token, statePath);

    // await writeFile(userDataPath, user);

    await use({ storageStatePath: statePath, userData: user });

    // Teardown: Clean up storage state and user data files after the worker finishes
    await deleteFile(statePath);
    // await deleteFile(userDataPath);
  },

  storageState: async ({ userState }, use) => {
    await use(userState.storageStatePath);
  },

  // workerUserSession: [
  //   async ({ apiHandlerWorker, userApiWorker }, use) => {
  //     const workerId = `4${test.info().title.replaceAll(' ', '-')}_${test.info().testId}`;
  //     const user = await registerRandomUser(apiHandlerWorker);
  //     const loginResponse = await userApiWorker.login(user.email, user.password);
  //     const token = loginResponse.access_token;

  //     const dir = 'playwright/.auth';
  //     const statePath = `${dir}/user-state-${workerId}.json`;
  //     const userDataPath = `${dir}/user-data-${workerId}.json`;

  //     await prefillStorageStateFile(token, statePath);

  //     await writeFile(userDataPath, user);

  //     await use({ storageStatePath: statePath, userData: user });

  //     // Teardown: Clean up storage state and user data files after the worker finishes
  //     await deleteFile(statePath);
  //     await deleteFile(userDataPath);
  //   },
  //   { scope: 'worker' },
  // ],

  // since using worker scoped storageState creates a risk of collision
  // in tests that mutate user state, it is safer to use test scoped fixture
  // This is test scope (default) and can now safely depend on a worker fixture
  // storageState: async ({ workerUserSession }, use) => {
  //   await use(workerUserSession.storageStatePath);
  // },
});

export { test };
