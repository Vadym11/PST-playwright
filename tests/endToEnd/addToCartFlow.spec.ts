import { test } from "../../fixtures/createNewUserAndLogin";
import { expect } from "@playwright/test";
import { HomePage } from "../../pages/HomePage";
import { LoginPage } from "../../pages/LoginPage";
import { User } from "../../types/user";
import { generateRandomuserData } from "../../test-utils/test-utils";
const connection = require('../../test-utils/mysqldb');

test.describe('Add to cart flow', () => {
    let newUser: User;
    const currentYear = new Date().getFullYear();
    
    test('Add to cart (signed in user)', async({page, newUserLoggedIn}) => {
        newUser = newUserLoggedIn;

        console.log(newUser.email);
        console.log(newUser.password);

        const homePage = await new HomePage(page).goTo();
        
        await homePage.header.clickSignInLink();

        const myAccountPage = await new LoginPage(page)
            .loginSuccess(newUser.email, newUser.password);

        console.log(`User with email ${newUser.email} has logged in.`)

        await myAccountPage.header.clickHomePageLink();
        
        console.log('Navigated to home page');
        
        const productPage = await homePage.clickFirstProduct();

        await productPage.clickAddToCart();

        await expect(productPage.getAddedToCartPopUp()).toBeVisible();

        await productPage.header.clickCartIcon();

        const shoppingCartMainPage = await productPage.header.clickCartIcon();

        const shoppingCartLoginPage = await shoppingCartMainPage.clickProceedToCheckout();

        const shoppingCartBillingPage = await shoppingCartLoginPage.clickProceedToCheckout();

        const billingDetailsFields = await shoppingCartBillingPage.getBillingAddresInputFields();

        const userBillingData = [
            newUser.address.street,
            newUser.address.city,
            newUser.address.state,
            newUser.address.postal_code
        ];

        billingDetailsFields.forEach(async (field) => {
            expect(userBillingData.includes(field)).toBeTruthy();
        })

        const shoppingCartPaymentPage = await shoppingCartBillingPage.clickProceedToCheckout();

        await shoppingCartPaymentPage.openPaymentMethodsDropdownMenu();
        await shoppingCartPaymentPage.selectCashOnDeliveryOption();
        await shoppingCartPaymentPage.clickConfirmButton();

        await expect(shoppingCartPaymentPage.getPaymentSuccessMessage())
            .toHaveText('Payment was successful');

        await shoppingCartPaymentPage.clickConfirmButton();

        await expect(shoppingCartPaymentPage.getInvoiceMessage())
            .toContainText(`Thanks for your order! Your invoice number is INV-${currentYear}`);
    })
});