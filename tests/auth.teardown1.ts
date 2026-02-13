import { test as setup } from '@fixtures/apiFixtures';
import path from 'path';
import { replaceTokenAndWriteToStateFile } from '@utils/test-utils';
import { StorageState } from '@models/storage-state';

const authFile = path.join(process.cwd(), 'playwright/.auth/userState1.json');

setup.use({ headless: true });

setup('Teardown', async () => {
  const emptyState: StorageState = {
    cookies: [],
    origins: [],
  };

  replaceTokenAndWriteToStateFile('', emptyState, authFile);
});
