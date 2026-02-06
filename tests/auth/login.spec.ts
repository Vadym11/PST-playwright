import { test } from '@fixtures/apiFixtures';
import { HomePage } from '@pages/HomePage';
import { LoginPage } from '@pages/LoginPage';
import { expect } from '@playwright/test';

test.describe('Login Feature', () => {
  // use empty storage state to ensure the user is logged out
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Login - happy path', async ({ page, newUserRegistered }) => {
    const homePage = await new HomePage(page).goTo();

    await homePage.header.clickSignInLink();

    const myAccountPage = await new LoginPage(page).loginSuccess(
      newUserRegistered.email,
      newUserRegistered.password,
    );

    await expect(myAccountPage.myAccountTitle).toHaveText('My account');
  });

  test('Login - incorrect email format', async ({ page, newUserRegistered }) => {
    const homePage = await new HomePage(page).goTo();

    await homePage.header.clickSignInLink();

    const loginPage = await new LoginPage(page).loginFail(
      `${newUserRegistered.first_name}.@gmail.com`,
      newUserRegistered.password,
    );

    await expect(loginPage.invalidEmailFormatMsg).toHaveText('Email format is invalid');
  });
});
