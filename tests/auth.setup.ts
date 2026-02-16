import { test as setup } from '@fixtures/apiFixtures';
import path from 'path';
import fs from 'fs';
import { prefillStorageStateFile, registerRandomUser } from '@utils/test-utils';

const authFile = path.join(process.cwd(), 'playwright/.auth/userState.json');
const userFile = path.join(process.cwd(), 'playwright/.auth/userData.json');

setup.use({ headless: true });

/**
 * this is the UI setup. To save time, we are using API to get token and save authenticated state
 */

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
 * API setup to get token and save authenticated state,
 * which will be used in UI tests to speed up the setup by skipping UI login
 */
setup('Register and authenticate user', async ({ workerApiHandler, userApi }) => {
  // 1. Create and register a random user
  const user = await registerRandomUser(workerApiHandler);

  // 2. Save User Data (email/password) to its own JSON file
  fs.writeFileSync(userFile, JSON.stringify(user, null, 4));

  // 3. Perform API Login
  const loginResponse = await userApi.login(user.email, user.password);

  // 4. Save Session State (Cookies/LocalStorage) with the token from API login
  const token = loginResponse.access_token;
  prefillStorageStateFile(token, authFile);
});
