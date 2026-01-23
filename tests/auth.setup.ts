import { test as setup } from '../fixtures/apiFixtures';
import { expect } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import fs from 'fs';
import { registerRandomUser } from '../utils/test-utils';

const authFile = path.join(__dirname, '../playwright/.auth/userState.json');
const userFile = path.join(__dirname, '../playwright/.auth/userData.json');

setup.use({ headless: true });

setup('Authenticate', async ({ page, apiHandler }) => {
  // 1. Create and register a random user
  const user = await registerRandomUser(apiHandler);

  // 2. Save User Data (email/password) to its own JSON file
  fs.writeFileSync(userFile, JSON.stringify(user, null, 4));

  // 3. Perform Browser Login
  const homePage = await new HomePage(page).goTo();
  await homePage.header.clickSignInLink();

  const myAccountPage = await new LoginPage(page).loginSuccess(user.email, user.password);

  // eslint-disable-next-line playwright/no-standalone-expect
  await expect(myAccountPage.myAccountTitle).toHaveText('My account');

  // 4. Save Session State (Cookies/LocalStorage)
  await page.context().storageState({ path: authFile });
});
