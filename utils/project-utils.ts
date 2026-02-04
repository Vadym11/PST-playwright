import { expect } from '@playwright/test';
import { ShoppingCartBillingPage } from '../pages/shoppingCart/ShoppingCartBillingPage';
import { User } from '@models/user';
import { PaymentMethods } from '@models/paymentMethods';

/**
 * Completes the checkout process and verifies billing details.
 * @param shoppingCartBillingPage
 * @param newUser
 * @param paymentMethod
 */
export async function completeCheckoutAndVerifyBilling(
  shoppingCartBillingPage: ShoppingCartBillingPage,
  newUser: User,
  paymentMethod: PaymentMethods,
) {
  const currentYear = new Date().getFullYear();
  const billingDetailsFields = shoppingCartBillingPage.getBillingAddresInputFields();

  await expect(billingDetailsFields.street).toHaveValue(newUser.address.street);
  await expect(billingDetailsFields.city).toHaveValue(newUser.address.city);
  await expect(billingDetailsFields.state).toHaveValue(newUser.address.state);
  await expect(billingDetailsFields.postCode).toHaveValue(newUser.address.postal_code);

  const shoppingCartPaymentPage = await shoppingCartBillingPage.clickProceedToCheckout();

  await shoppingCartPaymentPage.openPaymentMethodsDropdownMenu();

  switch (paymentMethod) {
    case PaymentMethods.cashOnDelivery:
      await shoppingCartPaymentPage.selectCashOnDeliveryOption();
      break;
    case PaymentMethods.bankTransfer:
      await shoppingCartPaymentPage.selectBankTransferAndFillDetails();
      break;
    case PaymentMethods.creditCard:
      await shoppingCartPaymentPage.selectCreditCardAndFillDetails(
        newUser.first_name + ' ' + newUser.last_name,
      );
      break;
    case PaymentMethods.giftCard:
      await shoppingCartPaymentPage.selectGiftCard();
      break;
    case PaymentMethods.buyNowPayLater:
      await shoppingCartPaymentPage.selectBuyNowPayLater();
      break;
    default:
      throw new Error(`Method ${paymentMethod} not implemented yet.`);
  }

  await shoppingCartPaymentPage.clickConfirmButton();

  await expect(shoppingCartPaymentPage.getPaymentSuccessMessage()).toHaveText(
    'Payment was successful',
  );

  await shoppingCartPaymentPage.clickConfirmButton();

  await expect(shoppingCartPaymentPage.getInvoiceMessage()).toContainText(
    `Thanks for your order! Your invoice number is INV-${currentYear}`,
  );
}
