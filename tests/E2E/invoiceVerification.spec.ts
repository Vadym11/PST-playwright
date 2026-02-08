import { test } from '@fixtures/getAuthenticatedUser';
import { expect } from '@playwright/test';
import { HomePage } from '@pages/HomePage';
import { completeCheckoutAndVerifyBilling } from '@utils/project-utils';
import { PaymentMethods } from '@models/paymentMethods';
import { faker } from '@faker-js/faker';
import { InvoiceDetailsPage } from '@pages/InvoiceDetailsPage';

test.describe('Verify invoice details', () => {
  let quantity: number;
  const paymentMethod = PaymentMethods.cashOnDelivery;

  test.describe(() => {
    test('Existing user - logged in', async ({ page, authenticatedUserData, productApi }) => {
      quantity = faker.datatype.number({ min: 1, max: 10 });

      const homePage = await new HomePage(page).goTo();

      const productPage = await homePage.selectRandomProduct();

      const productInfo = await productPage.getCurrentProductInfoById(productApi);

      await productPage.clickAddToCartAndAssertPopUps(quantity);

      await expect(productPage.getCartQuantity()).toHaveText(`${quantity}`);

      const shoppingCartMainPage = await productPage.header.clickCartIcon();

      const shoppingCartLoginPage = await shoppingCartMainPage.clickProceedToCheckout();

      const shoppingCartBillingPage = await shoppingCartLoginPage.clickProceedToCheckout();

      const shoppingCartPaymentPage = await completeCheckoutAndVerifyBilling(
        shoppingCartBillingPage,
        authenticatedUserData,
        paymentMethod,
      );

      const invoiceMessage = await shoppingCartPaymentPage.getInvoiceMessage().textContent();

      const invoiceNumber =
        invoiceMessage?.split('invoice number is ')[1].replaceAll('.', '') || '';

      const invoicesPage = await shoppingCartPaymentPage.header.goToInvoicesPage();

      const invoiceInfo = await invoicesPage.getInvoiceLineItems(invoiceNumber);

      await invoicesPage.verifyInvoiceLineItems(authenticatedUserData, productInfo, quantity);

      await invoiceInfo.detailsBtn.click();

      const invoiceDetailsPage = new InvoiceDetailsPage(page);

      await invoiceDetailsPage.verifyInvoiceDetails(
        productInfo,
        invoiceNumber,
        authenticatedUserData,
        quantity,
        paymentMethod,
      );
    });
  });
});
