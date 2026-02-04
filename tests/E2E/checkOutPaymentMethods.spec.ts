import { test } from '@fixtures/createNewUserAndLogin';
import { expect } from '@playwright/test';
import { HomePage } from '@pages/HomePage';
import { completeCheckoutAndVerifyBilling } from '@utils/project-utils';
import { PaymentMethods } from '@models/paymentMethods';
import path from 'path';
import fs from 'fs';

test.describe('Checkout flow', () => {
  let userData: any;

  const paymentMethods = [
    PaymentMethods.cashOnDelivery,
    PaymentMethods.giftCard,
    PaymentMethods.bankTransfer,
    PaymentMethods.buyNowPayLater,
    PaymentMethods.creditCard,
  ];

  const authFile = '../../playwright/.auth/userState.json';
  test.use({ storageState: path.join(__dirname, authFile) });

  test.beforeAll(async () => {
    const userPath = path.join(process.cwd(), 'playwright/.auth/userData.json');
    userData = JSON.parse(fs.readFileSync(userPath, 'utf-8'));
  });

  paymentMethods.forEach((paymentMethod) => {
    test(`Use ${paymentMethod}`, async ({ page }) => {
      const homePage = await new HomePage(page).goTo();

      const productPage = await homePage.selectRandomProduct();

      await productPage.clickAddToCart();

      await expect(productPage.getAddedToCartPopUp()).toBeVisible();
      await expect(productPage.getCartQuantity()).toHaveText('1');

      const shoppingCartMainPage = await productPage.header.clickCartIcon();

      const shoppingCartLoginPage = await shoppingCartMainPage.clickProceedToCheckout();

      const shoppingCartBillingPage = await shoppingCartLoginPage.clickProceedToCheckout();

      await completeCheckoutAndVerifyBilling(shoppingCartBillingPage, userData, paymentMethod);
    });
  });
});
