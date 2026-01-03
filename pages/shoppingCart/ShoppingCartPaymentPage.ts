import { Locator, Page } from "@playwright/test";
import { BasePage } from "../BasePage";
import { HeaderCommon } from "../HeaderCommon";

export class ShoppingCartPaymentPage extends BasePage {

    private readonly choosePaymentMethodMenu: Locator;
    private readonly monthlyInstallments: Locator;
    private readonly buyNowPayLaterOption: Locator;
    private readonly cashOnDelivery: Locator;
    private readonly confirmButon: Locator;
    private readonly paymentSuccessMessage: Locator;
    private readonly invoiceMessage: Locator;
    readonly header: HeaderCommon;

    constructor(page: Page) {
        super(page);
        this.choosePaymentMethodMenu = page.getByTestId('payment-method');
        this.buyNowPayLaterOption = page.getByRole('option', {name: 'Buy Now Pay Later'});
        this.monthlyInstallments = page.getByTestId('payment-method-buy-now-pay-later');
        this.cashOnDelivery = page.getByRole('option', {name: 'Cash on delivery'});
        this.confirmButon = page.getByRole('button', {name: 'Confirm'});
        this.paymentSuccessMessage = page.getByTestId('payment-success-message');
        this.invoiceMessage = page.locator("[id='order-confirmation']");
        this.header = new HeaderCommon(page);
    }

    async openPaymentMethodsDropdownMenu(): Promise<this> {
        await this.choosePaymentMethodMenu.click();

        return this;
    }

    async selectBuyNowPayLaterOption(): Promise<this> {
        await this.buyNowPayLaterOption.click();

        return this;
    }

    async selectCashOnDeliveryOption(): Promise<this> {
        await this.choosePaymentMethodMenu.selectOption({value: 'cash-on-delivery'});

        return this;
    }

    async clickConfirmButton(): Promise<this> {
        await this.confirmButon.click();

        return this;
    }

    getPaymentSuccessMessage(): Locator {
        return this.paymentSuccessMessage;
    }

    getInvoiceMessage(): Locator {
        return this.invoiceMessage;
    }

}