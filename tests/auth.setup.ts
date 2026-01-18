import { test as setup, chromium, expect } from '@playwright/test';
import path from 'path';
import { LoginPage } from '../pages/LoginPage';
import { HomePage } from '../pages/HomePage';
import fs from 'fs';
import { registerRandomUser } from '../utils/test-utils';

const authFile = path.join(__dirname, '../playwright/.auth/userState.json');
const userFile = path.join(__dirname, '../playwright/.auth/userData.json');

setup('Authenticate', async ({ request }) => {
    // 1. Create the user
    const user = await registerRandomUser(request);

    // 2. Save User Data (email/password) to its own JSON file
    // This lets the tests know WHO was registered
    fs.writeFileSync(userFile, JSON.stringify(user, null, 4));

    // 3. Perform Browser Login
    const browser = await chromium.launch({headless: true});
    const context = await browser.newContext();
    const page = await context.newPage();

    await page.goto(process.env.BASE_URL!);
    const homePage = new HomePage(page);
    await homePage.header.clickSignInLink();
    
    const myAccountPage = await new LoginPage(page).loginSuccess(user.email, user.password);

    await expect(myAccountPage.myAccountTitle).toHaveText('My account');

    // 4. Save Session State (Cookies/LocalStorage)
    // This is the file Playwright uses for 'storageState'
    await page.context().storageState({ path: authFile });

    await browser.close();
});