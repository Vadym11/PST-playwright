import { test } from '@fixtures/getAuthenticatedUser';
import { expect } from '@playwright/test';
import { HomePage } from '@pages/HomePage';
import { completeCheckoutAndVerifyBilling } from '@utils/project-utils';
import { PaymentMethods } from '@models/paymentMethods';
import { faker } from '@faker-js/faker';

test.describe('Checkout flow: cash', () => {
  let count: number;
  const paymentMethod = PaymentMethods.cashOnDelivery;

  test.describe(() => {
    test('Existing user - logged in', async ({ page, authenticatedUserData }) => {
      count = faker.datatype.number({ min: 1, max: 10 });

      const homePage = await new HomePage(page).goTo();

      const productPage = await homePage.selectRandomProduct();

      await productPage.clickAddToCartAndAssertPopUps(count);

      await expect(productPage.getCartQuantity()).toHaveText(`${count}`);

      const shoppingCartMainPage = await productPage.header.clickCartIcon();

      const shoppingCartLoginPage = await shoppingCartMainPage.clickProceedToCheckout();

      const shoppingCartBillingPage = await shoppingCartLoginPage.clickProceedToCheckout();

      await completeCheckoutAndVerifyBilling(
        shoppingCartBillingPage,
        authenticatedUserData,
        paymentMethod,
      );
    });
  });

  test.describe(() => {
    // use empty storage state to ensure the user is logged out
    test.use({ storageState: { cookies: [], origins: [] } });

    test('Existing user - logged out', async ({ page, authenticatedUserData }) => {
      count = faker.datatype.number({ min: 1, max: 10 });

      const homePage = await new HomePage(page).goTo();

      const productPage = await homePage.selectRandomProduct();

      await productPage.clickAddToCartAndAssertPopUps(count);

      await expect(productPage.getCartQuantity()).toHaveText(`${count}`);

      const shoppingCartMainPage = await productPage.header.clickCartIcon();

      const shoppingCartLoginPage = await shoppingCartMainPage.clickProceedToCheckout();

      await shoppingCartLoginPage.loginExistingUser(
        authenticatedUserData.email,
        authenticatedUserData.password,
      );

      const shoppingCartBillingPage = await shoppingCartLoginPage.clickProceedToCheckout();

      await completeCheckoutAndVerifyBilling(
        shoppingCartBillingPage,
        authenticatedUserData,
        paymentMethod,
      );
    });
  });
});
