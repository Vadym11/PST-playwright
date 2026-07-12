import { CreateUser } from '@models/api-user';
import { test as baseTest } from '@fixtures/apiFixtures';
import { UserAPI } from '@api-models/user';
import {
  deleteFile,
  generateRandomuserDataFaker,
  prefillStorageStateFile,
} from '@utils/test-utils';

type TestScopedFixtures = {
  userState: { storageStatePath: string; userData: CreateUser };
};

type WorkerScopedFixtures = {
  registeredUserDataWorker: CreateUser;
};

/**
 * A user who has completed a purchase is referenced by invoices/payments, and the
 * API refuses to delete it ("Seems like this customer is used elsewhere."). That's
 * expected for checkout/invoice tests, so it's swallowed here; any other failure
 * still surfaces as a real teardown error.
 */
async function deleteUserIfUnused(userApi: UserAPI, userId: string, adminToken: string) {
  try {
    await userApi.deleteUser(userId, adminToken);
  } catch (error) {
    if (error instanceof Error && error.message.includes('used elsewhere')) {
      console.log(`Skipping cleanup: user ${userId} has related records (e.g. invoices).`);

      return;
    }

    throw error;
  }
}

// first argument is for test scope fixtures, second - for worker scope fixtures
const test = baseTest.extend<TestScopedFixtures, WorkerScopedFixtures>({
  userState: async ({ userApi, adminTokenWorker }, use) => {
    const workerId = `${test.info().title.replaceAll(' ', '-')}_${test.info().testId}`;
    const user = generateRandomuserDataFaker();
    const userId = (await userApi.register(user)).id;
    const loginResponse = await userApi.login(user.email, user.password);
    const token = loginResponse.access_token;

    const dir = 'playwright/.auth';
    const statePath = `${dir}/user-state-${workerId}.json`;

    await prefillStorageStateFile(token, statePath);

    await use({ storageStatePath: statePath, userData: user });

    // Teardown: Clean up storage state file after the test finishes
    await deleteFile(statePath);

    // Teardown: Delete the user created for the test
    await deleteUserIfUnused(userApi, userId, adminTokenWorker);
  },

  storageState: async ({ userState }, use) => {
    await use(userState.storageStatePath);
  },

  registeredUserDataWorker: [
    async ({ userApiWorker, adminTokenWorker }, use) => {
      const user = generateRandomuserDataFaker();
      const userId = (await userApiWorker.register(user)).id;

      await use(user);

      // Teardown: Delete the user created for the worker session
      await deleteUserIfUnused(userApiWorker, userId, adminTokenWorker);
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
