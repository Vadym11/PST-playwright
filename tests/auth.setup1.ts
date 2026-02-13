import { test as setup } from '@fixtures/apiFixtures';
import { expect } from '@playwright/test';
import path from 'path';
import { LoginPage } from '@pages/LoginPage';
import { HomePage } from '@pages/HomePage';
import fs from 'fs';
import { prefillStorageStateFile, registerRandomUser } from '@utils/test-utils';

const authFile = path.join(process.cwd(), 'playwright/.auth/userState1.json');
const userFile = path.join(process.cwd(), 'playwright/.auth/userData1.json');

setup.use({ headless: true });

// setup('Authenticate', async ({ page, apiHandler }) => {
//   // 1. Create and register a random user
//   const user = await registerRandomUser(apiHandler);

//   // 2. Save User Data (email/password) to its own JSON file
//   fs.writeFileSync(userFile, JSON.stringify(user, null, 4));

//   // 3. Perform Browser Login
//   const homePage = await new HomePage(page).goTo();
//   await homePage.header.clickSignInLink();

//   const myAccountPage = await new LoginPage(page).loginSuccess(user.email, user.password);

//   // eslint-disable-next-line playwright/no-standalone-expect
//   await expect(myAccountPage.myAccountTitle).toHaveText('My account');

//   // 4. Save Session State (Cookies/LocalStorage)
//   await page.context().storageState({ path: authFile });
// });

/**
 * API setup to get token and save authenticated state, which will be used in UI tests
 */
setup('Authenticate', async ({ apiHandler, userApi }) => {
  // 1. Create and register a random user
  const user = await registerRandomUser(apiHandler);

  // 2. Save User Data (email/password) to its own JSON file
  fs.writeFileSync(userFile, JSON.stringify(user, null, 4));

  // 3. Perform API Login
  const loginResponse = await userApi.login(user.email, user.password);

  // 4. Save Session State (Cookies/LocalStorage) with the token from API login
  const token = loginResponse.access_token;
  prefillStorageStateFile(token, authFile);
});
