import { test } from '@fixtures/getAuthenticatedUser';
import { expect } from '@playwright/test';
import { HomePage } from '@pages/HomePage';
import { completeCheckoutAndVerifyBilling } from '@utils/project-utils';
import { PaymentMethods } from '@models/paymentMethods';
import { faker } from '@faker-js/faker';
import fs from 'fs';
import { userDataFilePath } from '@utils/test-utils';

test.describe('Checkout flow: cash', () => {
  let userData: any;
  let count: number;
  const paymentMethod = PaymentMethods.cashOnDelivery;

  test.beforeAll('Get existing user data', async () => {
    userData = JSON.parse(fs.readFileSync(userDataFilePath, 'utf-8'));
  });

  test.describe('Logged in existing user', () => {
    test('', async ({ page }) => {
      count = faker.datatype.number({ min: 1, max: 10 });

      const homePage = await new HomePage(page).goTo();

      const productPage = await homePage.selectRandomProduct();

      await productPage.clickAddToCartAndAssertPopUps(count);

      await expect(productPage.getCartQuantity()).toHaveText(`${count}`);

      const shoppingCartMainPage = await productPage.header.clickCartIcon();

      const shoppingCartLoginPage = await shoppingCartMainPage.clickProceedToCheckout();

      const shoppingCartBillingPage = await shoppingCartLoginPage.clickProceedToCheckout();

      await completeCheckoutAndVerifyBilling(shoppingCartBillingPage, userData, paymentMethod);
    });
  });

  test.describe('Logged out existing user', () => {
    // use empty storage state to ensure the user is logged out
    test.use({ storageState: { cookies: [], origins: [] } });

    test('', async ({ page }) => {
      count = faker.datatype.number({ min: 1, max: 10 });

      const homePage = await new HomePage(page).goTo();

      const productPage = await homePage.selectRandomProduct();

      await productPage.clickAddToCartAndAssertPopUps(count);

      await expect(productPage.getCartQuantity()).toHaveText(`${count}`);

      const shoppingCartMainPage = await productPage.header.clickCartIcon();

      const shoppingCartLoginPage = await shoppingCartMainPage.clickProceedToCheckout();

      await shoppingCartLoginPage.loginExistingUser(userData.email, userData.password);

      const shoppingCartBillingPage = await shoppingCartLoginPage.clickProceedToCheckout();

      await completeCheckoutAndVerifyBilling(shoppingCartBillingPage, userData, paymentMethod);
    });
  });
});
