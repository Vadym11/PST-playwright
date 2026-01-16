import { Locator, Page } from "@playwright/test";
import { BasePage } from "../BasePage";
import { ShoppingCartPaymentPage } from "./ShoppingCartPaymentPage";
import { BillingFields } from "../../types/billingFields";

export class ShoppingCartBillingPage extends BasePage {

    private readonly street: Locator;
    private readonly city: Locator;
    private readonly state: Locator;
    private readonly postCode: Locator;
    private readonly proceesToCheckOutButton: Locator;

    constructor(page: Page) {
        super(page);
        this.street = page.getByTestId('street');
        this.city = page.getByTestId('city');
        this.state = page.getByTestId('state');
        this.postCode = page.getByTestId('postal_code');
        this.proceesToCheckOutButton = page.getByRole('button', {name: 'Proceed to checkout'}); 
    }

    getStreetInput(): Locator {
        return  this.street;
    }

    getCityInput(): Locator {
        return this.city;
    }

    getStateInput(): Locator {
        return this.state;
    }

    getPostCodeInput(): Locator {
        return this.postCode;
    }

    getBillingAddresInputFields(): BillingFields {

        return {
                street: this.getStreetInput(),
                city: this.getCityInput(),
                state: this.getStateInput(),
                postCode: this.getPostCodeInput()
            };
    }

    async clickProceedToCheckout(): Promise<ShoppingCartPaymentPage> {
        await this.proceesToCheckOutButton.click();

        return new ShoppingCartPaymentPage(this.page);
    }

}