import { test } from '../../fixtures/createNewUserAndLogin';
import { expect } from '@playwright/test';
import { HomePage } from '../../pages/HomePage';
import { LoginPage } from '../../pages/LoginPage';
import { User } from '../../types/user';
import { completeCheckoutAndVerifyBilling } from '../../utils/project-utils';
import { PaymentMethods } from '../../types/paymentMethods';

test.describe('Add to cart flow', () => {
  let newUser: User;
  const paymentMethod = PaymentMethods.cashOnDelivery;

  test.beforeAll('Register and store new user data ', async ({ newUserRegistered }) => {
    newUser = newUserRegistered;
  });

  test('Add to cart (signed in existing user)', async ({ page }) => {
    const homePage = await new HomePage(page).goTo();

    await homePage.header.clickSignInLink();

    const myAccountPage = await new LoginPage(page).loginSuccess(newUser.email, newUser.password);

    await myAccountPage.header.clickHomePageLink();

    const productPage = await homePage.clickFirstProduct();

    await productPage.clickAddToCart();

    await expect(productPage.getAddedToCartPopUp()).toBeVisible();
    await expect(productPage.getCartQuantity()).toHaveText('1');

    const shoppingCartMainPage = await productPage.header.clickCartIcon();

    const shoppingCartLoginPage = await shoppingCartMainPage.clickProceedToCheckout();

    const shoppingCartBillingPage = await shoppingCartLoginPage.clickProceedToCheckout();

    await completeCheckoutAndVerifyBilling(shoppingCartBillingPage, newUser, paymentMethod);
  });

  test('Add to cart (signed out existing user)', async ({ page }) => {
    const homePage = await new HomePage(page).goTo();

    const productPage = await homePage.clickFirstProduct();

    await productPage.clickAddToCart();

    await expect(productPage.getAddedToCartPopUp()).toBeVisible();
    await expect(productPage.getCartQuantity()).toHaveText('1');

    const shoppingCartMainPage = await productPage.header.clickCartIcon();

    const shoppingCartLoginPage = await shoppingCartMainPage.clickProceedToCheckout();

    await shoppingCartLoginPage.loginExistingUser(newUser.email, newUser.password);

    const shoppingCartBillingPage = await shoppingCartLoginPage.clickProceedToCheckout();

    await completeCheckoutAndVerifyBilling(shoppingCartBillingPage, newUser, paymentMethod);
  });
});
