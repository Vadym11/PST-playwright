import { test } from '@fixtures/getAuthenticatedUser';
import { expect } from '@playwright/test';
import { HomePage } from '@pages/HomePage';
import { completeCheckoutAndVerifyBilling } from '@utils/project-utils';
import { PaymentMethods } from '@models/paymentMethods';

test.describe('Checkout flow', () => {
  const paymentMethods = [
    PaymentMethods.cashOnDelivery,
    PaymentMethods.giftCard,
    PaymentMethods.bankTransfer,
    PaymentMethods.buyNowPayLater,
    PaymentMethods.creditCard,
  ];

  paymentMethods.forEach((paymentMethod) => {
    test(`Use ${paymentMethod}`, async ({ page, authenticatedUserData }) => {
      const homePage = await new HomePage(page).goTo();

      const productPage = await homePage.selectRandomProduct();

      await productPage.clickAddToCart();

      await expect(productPage.getAddedToCartPopUp()).toBeVisible();
      await expect(productPage.getCartQuantity()).toHaveText('1');

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
});
