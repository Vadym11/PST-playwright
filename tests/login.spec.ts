import {test, expect} from '@playwright/test';
import { HomePage } from '../pages/homePage';
import { LoginPage } from '../pages/loginPage';

test.describe('Login Feature ', () => {

    test.skip('Login_withValidUserCredentials_dasboardIsDisplayed', async ({page}) => {
        await page.goto('');

        await page.locator('[data-test="nav-sign-in"]').click();

        await page.locator('[data-test="email"]').fill('customer@practicesoftwaretesting.com');
        await page.locator('[data-test="password"]').fill('welcome01');
        await page.locator('[data-test="login-submit"]').click();

        await expect(page.locator('[data-test="page-title"]')).toContainText('My account');
    });

    test('Login POM happy path', async ({page}) => {

        const homePage = await new HomePage(page).goTo();

        await homePage.header.clickMainBanner();

        await homePage.header.clickSignInLink();

        const myAccountPage = await new LoginPage(page)
            .loginSuccess('customer@practicesoftwaretesting.com', 'welcome01');

        await expect(myAccountPage.myAccountTitle).toHaveText('My account');
    });

    test('Login POM incorrect email format', async ({page}) => {

        const homePage = await new HomePage(page).goTo();

        await homePage.header.clickMainBanner();

        await homePage.header.clickSignInLink();

        const loginPage = await new LoginPage(page)
            .loginFail('customer.practicesoftwaretesting.com', 'welcome01');

        await expect(loginPage.invalidEmailFormatMsg).toHaveText('Email format is invalid');
    });
});