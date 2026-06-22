import { test as baseTest } from '@fixtures/apiFixtures';
import { deleteFile, prefillStorageStateFile } from '@utils/test-utils';

type WorkerScopedFixtures = {
  adminUserStateWorker: string;
};

// first argument is for test scope fixtures, second - for worker scope fixtures
const test = baseTest.extend<object, WorkerScopedFixtures>({
  adminUserStateWorker: [
    async ({ adminTokenWorker }, use, workerInfo) => {
      const dir = 'playwright/.auth';
      const adminStatePath = `${dir}/admin-state-worker-${workerInfo.workerIndex}.json`;

      await prefillStorageStateFile(adminTokenWorker, adminStatePath);

      await use(adminStatePath);

      // Teardown: Clean up admin storage state file after the worker finishes
      await deleteFile(adminStatePath);
    },
    { scope: 'worker' },
  ],

  storageState: async ({ adminUserStateWorker }, use) => {
    await use(adminUserStateWorker);
  },
});

export { test };
