import { expect } from "@playwright/test";
import { ShoppingCartBillingPage } from "../pages/shoppingCart/ShoppingCartBillingPage";
import { User } from "../types/user";

export async function completeCheckoutAndVerifyBilling(shoppingCartBillingPage: ShoppingCartBillingPage, newUser: User, currentYear: number) {

    const billingDetailsFields = shoppingCartBillingPage.getBillingAddresInputFields();

    await expect(billingDetailsFields.street).toHaveValue(newUser.address.street);
    await expect(billingDetailsFields.city).toHaveValue(newUser.address.city);
    await expect(billingDetailsFields.state).toHaveValue(newUser.address.state);
    await expect(billingDetailsFields.postCode).toHaveValue(newUser.address.postal_code);

    const shoppingCartPaymentPage = await shoppingCartBillingPage.clickProceedToCheckout();

    await shoppingCartPaymentPage.openPaymentMethodsDropdownMenu();
    await shoppingCartPaymentPage.selectCashOnDeliveryOption();
    await shoppingCartPaymentPage.clickConfirmButton();

    await expect(shoppingCartPaymentPage.getPaymentSuccessMessage())
        .toHaveText('Payment was successful');

    await shoppingCartPaymentPage.clickConfirmButton();

    await expect(shoppingCartPaymentPage.getInvoiceMessage())
        .toContainText(`Thanks for your order! Your invoice number is INV-${currentYear}`);
}
