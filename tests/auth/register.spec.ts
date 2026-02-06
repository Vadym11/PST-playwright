import { test } from '@fixtures/apiFixtures';
import { expect } from '@playwright/test';
import { HomePage } from '@pages/HomePage';
import { LoginPage } from '@pages/LoginPage';
import { generateRandomuserDataFaker } from '@utils/test-utils';
import { CreateUser } from '@models/api-user';
import { deleteUserAPI, getUserByEmailAPI, getUserIdByEmailAPI } from '@utils/api-utils';

// test.use({ storageState: path.join(__dirname, '.authFile/userLocal.json') });
test.describe.serial('Registration feature', () => {
  // use empty storage state to ensure the user is logged out
  test.use({ storageState: { cookies: [], origins: [] } });

  let newUserData: CreateUser;

  test.beforeAll('Generate new user data', async () => {
    newUserData = generateRandomuserDataFaker();
    console.log(`User with email ${newUserData.email} has been generated.`);
  });

  test.afterAll('Delete registered user', async ({ apiHandler }) => {
    const newUserId = await getUserIdByEmailAPI(apiHandler, newUserData.email);

    const response = await deleteUserAPI(apiHandler, newUserId);

    if (response !== 204) {
      console.warn(
        `Cleanup Warning: Failed to delete user ${newUserData.email}. Manual cleanup may be required.`,
      );
    } else {
      console.log(`User with email ${newUserData.email} has been deleted.`);
    }
  });

  test('Register new user: happy path', async ({ page, apiHandler }) => {
    await test.step('Register new user', async () => {
      const homePage = await new HomePage(page).goTo();

      await homePage.header.clickSignInLink();

      const registerPage = await new LoginPage(page).clickRegisterLink();

      const loginPage = await registerPage.registerNewUser(newUserData);

      await expect(loginPage.getLoginHeader()).toContainText('Login');

      console.log(
        `User with email ${newUserData.email} and password ${newUserData.password} has registered.`,
      );
    });

    await test.step('Verify user has been registered', async () => {
      const newUser = await getUserByEmailAPI(apiHandler, newUserData.email);

      expect(newUser.first_name).toBe(newUserData.first_name);
      expect(newUser.last_name).toBe(newUserData.last_name);
      expect(newUser.dob).toBe(newUserData.dob);
    });
  });

  test('Register new user: user exists', async ({ page }) => {
    const homePage = await new HomePage(page).goTo();

    await homePage.header.clickSignInLink();

    const registerPage = await new LoginPage(page).clickRegisterLink();

    await registerPage.registerNewUser(newUserData);

    await expect(registerPage.getCustomerExistMessage()).toContainText(
      'A customer with this email address already exists.',
    );
  });
});
