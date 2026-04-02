import { test } from '@fixtures/getAuthenticatedUser';
import { LoginPage } from '@pages/LoginPage';
import { expect } from '@playwright/test';

test.describe('Login Feature', () => {
  // use empty storage state to ensure the user is unauthenticated at the start of each test
  // test.use({ storageState: { cookies: [], origins: [] } });

  test(
    'TC-AUTH-001 - happy path',
    { tag: ['@smoke', '@auth', '@ui'] },
    async ({ page, workerUserSession }) => {
      const loginPage = new LoginPage(page);

      await loginPage.open();

      const myAccountPage = await loginPage.loginSuccess(
        workerUserSession.email,
        workerUserSession.password,
      );

      await expect(page).toHaveURL('/account');
      await expect(myAccountPage.myAccountTitle).toHaveText('My account');
    },
  );

  test('TC-AUTH-002-1 - Incorrect Email Format', async ({ page, workerUserSession }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();

    await loginPage.loginFail(
      `${workerUserSession.first_name}.@gmail.com`,
      workerUserSession.password,
    );

    await expect(loginPage.invalidEmailFormatMsg).toHaveText('Email format is invalid');
  });

  test('TC-AUTH-002 - Incorrect Password', async ({ page, workerUserSession }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();

    await loginPage.loginFail(workerUserSession.email, 'incorrectPassword123');

    await expect(loginPage.invalidPasswordMsg).toHaveText('Invalid email or password');
  });

  test('TC-AUTH-003 - Non-Existent Email', async ({ page, workerUserSession }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();

    await loginPage.loginFail('notauser@example.com', workerUserSession.password);

    await expect(loginPage.invalidPasswordMsg).toHaveText('Invalid email or password');
  });

  test('TC-AUTH-004 - Empty Fields', async ({ page }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();

    await loginPage.clickLoginButton();

    await expect(loginPage.emailRequiredMsg).toHaveText('Email is required');
    await expect(loginPage.passwordRequiredMsg).toHaveText('Password is required');
  });

  test(
    'TC-AUTH-005 - Successful Logout',
    { tag: ['@smoke', '@auth', '@ui'] },
    async ({ page, workerUserSession }) => {
      const loginPage = new LoginPage(page);

      await loginPage.open();

      const myAccountPage = await loginPage.loginSuccess(
        workerUserSession.email,
        workerUserSession.password,
      );

      await myAccountPage.myAccountTitle.waitFor();

      await myAccountPage.clickSignOut();

      await expect(loginPage.loginHeader).toHaveText('Login');
    },
  );

  test('TC-AUTH-008 - Admin Cannot Access Admin Panel Without Login', async ({ page }) => {
    await page.goto('/admin/dashboard');

    const loginPage = new LoginPage(page);

    await expect(page).toHaveURL('/auth/login');

    await expect(loginPage.loginHeader).toHaveText('Login');
  });

  test('TC-AUTH-009 - Customer Cannot Access Admin Panel', async ({ page, workerUserSession }) => {
    const loginPage = new LoginPage(page);

    await loginPage.open();

    const myAccountPage = await loginPage.loginSuccess(
      workerUserSession.email,
      workerUserSession.password,
    );

    await myAccountPage.myAccountTitle.waitFor();
    // Attempt to access admin panel
    await page.goto('/admin/dashboard');

    // Verify that access is denied and user is redirected to login page
    await expect(page).toHaveURL('/auth/login');
    await expect(loginPage.loginHeader).toHaveText('Login');
  });

  test(
    'TC-AUTH-010 - Admin Successful Login',
    { tag: ['@smoke', '@auth', '@ui'] },
    async ({ page }) => {
      const adminEmail = process.env.EMAIL!;
      const adminPassword = process.env.PASSWORD_!;
      const loginPage = new LoginPage(page);

      await loginPage.open();

      const adminAccountPage = await loginPage.loginSuccess(adminEmail, adminPassword);

      await expect(page).toHaveURL('/admin/dashboard');
      await expect(adminAccountPage.myAccountTitle).toHaveText('Sales over the years');
    },
  );
});
