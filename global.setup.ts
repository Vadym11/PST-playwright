import { chromium, FullConfig, expect, selectors } from '@playwright/test';
import path from 'path';
import { LoginPage } from './lib/pages/LoginPage';
import { HomePage } from './lib/pages/HomePage';
import fs from 'fs';
import dotenv from 'dotenv';
import { generateRandomUserData } from './lib/utils/test-utils';
import { authFilePath, userDataFilePath } from './lib/utils/test-utils';
dotenv.config({ debug: true });

const baseURL = process.env.BASE_URL || 'http://127.0.0.1:8080/';

/*config: FullConfig is optinal argument that allows to access the full structure of the configuration.*/
async function globalSetup(config: FullConfig) {
  const newRegisteredUser = generateRandomUserData();
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

  console.log('Starting authentication...');
  await page.goto(baseURL);
  const homePage = new HomePage(page);

  await homePage.header.clickMainBanner();

  await homePage.header.clickSignInLink();

  const myAccountPage = await new LoginPage(page).loginSuccess(
    newRegisteredUser.email,
    newRegisteredUser.password,
  );

  await expect(myAccountPage.myAccountTitle).toHaveText('My account');

  await page.context().storageState({ path: authFilePath });

  await browser.close();

  // 2. Save User Data (email/password) to its own JSON file
  fs.writeFileSync(userDataFilePath, JSON.stringify(newRegisteredUser, null, 4));
  console.log('Authentication finished sucessfully!');
}

export default globalSetup;
