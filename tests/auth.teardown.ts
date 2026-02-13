import { test as teardown } from '@fixtures/apiFixtures';
import path from 'path';
import { readStorageStateFile, replaceTokenAndWriteToStateFile } from '@utils/test-utils';

const authFile = path.join(process.cwd(), 'playwright/.auth/userState.json');

teardown.use({ headless: true });

teardown('Teardown - invalidate token', async () => {
  const currentStateStorage = readStorageStateFile();

  replaceTokenAndWriteToStateFile('', currentStateStorage, authFile);
});
