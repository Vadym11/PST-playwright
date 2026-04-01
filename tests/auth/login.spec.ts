import { test } from '@fixtures/apiFixtures';
import { HomePage } from '@pages/HomePage';
import { LoginPage } from '@pages/LoginPage';
import { expect } from '@playwright/test';
import { generateRandomuserDataFaker } from '@utils/test-utils';

test.describe('Login Feature', () => {
  const newUserRegistered = generateRandomuserDataFaker();

  test.beforeAll('Create and register new user', async ({ apiHandler, userApi, adminToken }) => {
    const registerResponse = await userApi.register(newUserRegistered);
    expect(registerResponse.id).toEqual(expect.any(String));
    // This step is needed to ensure that we have a registered user to test login functionality with.
    // The user is created and registered using API calls for efficiency and reliability.
    console.log(
      `User with email ${newUserRegistered.email} has been created and registered for login tests.`,
    );
  });

  // use empty storage state to ensure the user is logged out
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Login - happy path', async ({ page }) => {
    const homePage = await new HomePage(page).goTo();

    await homePage.header.clickSignInLink();

    const myAccountPage = await new LoginPage(page).loginSuccess(
      newUserRegistered.email,
      newUserRegistered.password,
    );

    await expect(myAccountPage.myAccountTitle).toHaveText('My account');
  });

  test('Login - incorrect email format', async ({ page }) => {
    const homePage = await new HomePage(page).goTo();

    await homePage.header.clickSignInLink();

    const loginPage = await new LoginPage(page).loginFail(
      `${newUserRegistered.first_name}.@gmail.com`,
      newUserRegistered.password,
    );

    await expect(loginPage.invalidEmailFormatMsg).toHaveText('Email format is invalid');
  });
});
