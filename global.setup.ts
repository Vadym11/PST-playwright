import { chromium, FullConfig, expect, selectors } from '@playwright/test';
import path from 'path';
import { LoginPage } from './lib/pages/LoginPage';
import { HomePage } from './lib/pages/HomePage';
import fs from 'fs';
import dotenv from 'dotenv';
import { registerRandomUser } from './lib/utils/test-utils';
import { APIRequestContext } from '@playwright/test';
dotenv.config({ debug: true });

const authFile = path.join(process.cwd(), 'playwright/.auth/userState.json');
const userFile = path.join(process.cwd(), 'playwright/.auth/userData.json');
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:8080/';

/*config: FullConfig is optinal argument that allows to access the full structure of the configuration.*/
async function globalSetup(config: FullConfig, apiHandler: APIRequestContext) {
  const registeredUser = await registerRandomUser(apiHandler);
  const { testIdAttribute } = config.projects[0].use;
  if (testIdAttribute) {
    selectors.setTestIdAttribute(testIdAttribute);
  }

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  /*Example of using config */
  const project = config.projects[0];
  console.log(project.name);
  console.log(project.use.baseURL);

  console.log('Starting authentification...');
  await page.goto(baseURL);
  const homePage = new HomePage(page);

  await homePage.header.clickMainBanner();

  await homePage.header.clickSignInLink();

  const myAccountPage = await new LoginPage(page).loginSuccess(
    registeredUser.email,
    registeredUser.password,
  );

  await expect(myAccountPage.myAccountTitle).toHaveText('My account');

  await page.context().storageState({ path: authFile });

  await browser.close();

  // 2. Save User Data (email/password) to its own JSON file
  fs.writeFileSync(userFile, JSON.stringify(registeredUser, null, 4));
  console.log('Authentification finished sucessfully!');
}

export default globalSetup;
