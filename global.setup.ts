import { chromium, FullConfig, expect, selectors } from '@playwright/test';
import path from 'path';
import { LoginPage } from './pages/LoginPage';
import { HomePage } from './pages/HomePage';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config({debug: true});

const authFile = path.join(__dirname, './playwright/.auth/userGlobal.json');
const email = process.env.EMAIL!;
const password = process.env.PASSWORD_!;
const baseURL = process.env.BASE_URL || 'http://127.0.0.1:8080/';

/*config: FullConfig is optinal argument that allows to access the full structure of the configuration*/
async function globalSetup(config: FullConfig) {

    const { testIdAttribute } = config.projects[0].use; 
    if (testIdAttribute) {
        selectors.setTestIdAttribute(testIdAttribute);
    }

    if (!fs.existsSync(authFile)) {
        const browser = await chromium.launch({ headless: true });
        const page = await browser.newPage();

        /*Example of using config */
        const project = config.projects[0];
        console.log(project.name);
        console.log(project.use.baseURL);

        console.log('Starting authentification...')
        await page.goto(baseURL);
        const homePage = new HomePage(page);

        await homePage.header.clickMainBanner();

        await homePage.header.clickSignInLink();

        const myAccountPage = await new LoginPage(page)
            .loginSuccess(email, password);

        await expect(myAccountPage.myAccountTitle).toHaveText('My account');

        await page.context().storageState({ path: authFile });

        await browser.close();
        console.log('Authentification finished sucessfully!')
    }
}

export default globalSetup;