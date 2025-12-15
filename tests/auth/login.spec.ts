import {test, expect} from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';

test.describe('Login Feature ', () => {

    const authFile = path.join(__dirname, '../playwright/.auth/userGlobal.json');

    const email = process.env.EMAIL!;
    const password = process.env.PASSWORD_!;

    test.skip('Login_withValidUserCredentials_dasboardIsDisplayed', async ({page}) => {
        await page.goto('');

        await page.locator('[data-test="nav-sign-in"]').click();

        await page.locator('[data-test="email"]').fill(email);
        await page.locator('[data-test="password"]').fill(password);
        await page.locator('[data-test="login-submit"]').click();

        await expect(page.locator('[data-test="page-title"]')).toContainText('My account');
    });

    test.skip('Login POM happy path', async ({page}) => {

        const homePage = await new HomePage(page).goTo();

        await homePage.header.signOut();
        await homePage.header.clickSignInLink();

        const myAccountPage = await new LoginPage(page)
            .loginSuccess(email, password);

        await expect(myAccountPage.myAccountTitle).toHaveText('My account');
    });

    test.skip('Login POM incorrect email format', async ({page}) => {

        const homePage = await new HomePage(page).goTo();

        await homePage.header.signOut();
        await homePage.header.clickSignInLink();

        const loginPage = await new LoginPage(page)
            .loginFail('emaill.@gmail.com', password);

        await expect(loginPage.invalidEmailFormatMsg).toHaveText('Email format is invalid');
    });


    // The after hook ensures cleanup happens regardless of test pass/fail
    test.afterAll(async () => {
        if (fs.existsSync(authFile)) {
            console.log(`Deleting storage state file: ${authFile}`);
            fs.unlinkSync(authFile); // Force delete the file
        }
    });
});