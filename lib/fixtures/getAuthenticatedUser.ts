import { CreateUser } from '@models/api-user';
import { test as baseTest } from '@fixtures/apiFixtures';
import fs from 'fs';
import {
  userDataFilePath,
  checkTokenExpiry,
  getCurrentToken,
  readStorageStateFile,
  replaceTokenAndWriteToStateFile,
} from '@utils/test-utils';
import { StorageState } from '@models/storage-state';
import path from 'path';

type NewUserLoggedInFixture = {
  authenticatedUserData: CreateUser;
};

const test = baseTest.extend<NewUserLoggedInFixture>({
  authenticatedUserData: async ({ userApi, page }, use) => {
    const authFile = path.join(process.cwd(), 'playwright/.auth/userState.json');
    const userData = JSON.parse(fs.readFileSync(userDataFilePath, 'utf-8'));

    const currentToken = getCurrentToken();

    if (!currentToken) {
      throw new Error('No token found in storage state file');
    }

    if (checkTokenExpiry(currentToken)) {
      console.log('Token is about to expire, refreshing token...');
      const loginResponse = await userApi.refreshToken(currentToken);
      const freshToken = loginResponse.access_token;

      await page.goto(process.env.BASE_URL!);

      await page.evaluate(
        ([newToken]) => {
          localStorage.setItem('value', newToken);
        },
        [freshToken],
      );

      const state: StorageState = readStorageStateFile();

      replaceTokenAndWriteToStateFile(freshToken, state, authFile);
      console.log('Token refreshed and storage state file updated');
    }

    await use(userData);
  },
});

export { test };
