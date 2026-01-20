import { test } from '../../fixtures/createNewUserAndLogin';
import { expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { completeCheckoutAndVerifyBilling } from '../../utils/project-utils';
import { PaymentMethods } from '../../types/paymentMethods';
import path from 'path';
import { faker } from '@faker-js/faker';
import fs from 'fs';

test.describe('Checkout flow: cash', () => {
  let newUser: any;
  let count: number;
  const paymentMethod = PaymentMethods.cashOnDelivery;

  const authFile = '../../playwright/.auth/userState.json';

  test.beforeAll('Register and store new user data', async () => {
    const userPath = path.join(process.cwd(), 'playwright/.auth/userData.json');
    newUser = JSON.parse(fs.readFileSync(userPath, 'utf-8'));
  });

  test.describe('Logged in existing user', () => {
    test.use({ storageState: path.join(__dirname, authFile) });

    test('', async ({ page }) => {
      count = faker.datatype.number({ min: 1, max: 10 });

      const homePage = await new HomePage(page).goTo();

      const productPage = await homePage.selectRandomProduct();

      await productPage.clickAddToCartAndAssertPopUps(count);

      await expect(productPage.getCartQuantity()).toHaveText(`${count}`);

      const shoppingCartMainPage = await productPage.header.clickCartIcon();

      const shoppingCartLoginPage = await shoppingCartMainPage.clickProceedToCheckout();

      const shoppingCartBillingPage = await shoppingCartLoginPage.clickProceedToCheckout();

      await completeCheckoutAndVerifyBilling(shoppingCartBillingPage, newUser, paymentMethod);
    });
  });

  test('Logged out existing user', async ({ page }) => {
    count = faker.datatype.number({ min: 1, max: 10 });

    const homePage = await new HomePage(page).goTo();

    const productPage = await homePage.selectRandomProduct();

    await productPage.clickAddToCartAndAssertPopUps(count);

    await expect(productPage.getCartQuantity()).toHaveText(`${count}`);

    const shoppingCartMainPage = await productPage.header.clickCartIcon();

    const shoppingCartLoginPage = await shoppingCartMainPage.clickProceedToCheckout();

    await shoppingCartLoginPage.loginExistingUser(newUser.email, newUser.password);

    const shoppingCartBillingPage = await shoppingCartLoginPage.clickProceedToCheckout();

    await completeCheckoutAndVerifyBilling(shoppingCartBillingPage, newUser, paymentMethod);
  });
});
