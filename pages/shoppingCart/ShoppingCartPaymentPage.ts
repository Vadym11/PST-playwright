import { Locator, Page } from "@playwright/test";
import { BasePage } from "../BasePage";
import { HeaderCommon } from "../HeaderCommon";

export class ShoppingCartPaymentPage extends BasePage {

    private readonly choosePaymentMethodMenu: Locator;
    private readonly confirmButon: Locator;
    private readonly paymentSuccessMessage: Locator;
    private readonly invoiceMessage: Locator;
    readonly header: HeaderCommon;

    constructor(page: Page) {
        super(page);
        this.choosePaymentMethodMenu = page.getByTestId('payment-method');
        this.confirmButon = page.getByRole('button', {name: 'Confirm'});
        this.paymentSuccessMessage = page.getByTestId('payment-success-message');
        this.invoiceMessage = page.locator("[id='order-confirmation']");
        this.header = new HeaderCommon(page);
    }

    async openPaymentMethodsDropdownMenu(): Promise<this> {
        await this.choosePaymentMethodMenu.click();

        return this;
    }

    async selectBankTransferAndFillDetails(): Promise<this> {
        await this.choosePaymentMethodMenu.selectOption({value: 'bank-transfer'});

        await this.page.getByTestId('bank_name').fill('Test Bank');
        await this.page.getByTestId('account_name').fill('Test Account');
        await this.page.getByTestId('account_number').fill('123456781');

        return this;
    }

    async selectCashOnDeliveryOption(): Promise<this> {
        await this.choosePaymentMethodMenu.selectOption({value: 'cash-on-delivery'});

        return this;
    }

    async selectCreditCardAndFillDetails(cardHolderName: string): Promise<this> {
        await this.choosePaymentMethodMenu.selectOption({value: 'credit-card'});

        await this.page.getByTestId('credit_card_number').fill('4111-1111-1111-1111');
        await this.page.getByTestId('expiration_date').fill('05/2029');
        await this.page.getByTestId('cvv').fill('123');
        await this.page.getByTestId('card_holder_name').fill(cardHolderName);

        return this;
    }

    async selectBuyNowPayLater(): Promise<this> {
        await this.choosePaymentMethodMenu.selectOption({value: 'buy-now-pay-later'});

        await this.page.getByTestId('monthly_installments').selectOption({value: '6'});

        return this;
    }

    async selectGiftCard(): Promise<this> {
        await this.choosePaymentMethodMenu.selectOption({value: 'gift-card'});

        await this.page.getByTestId('gift_card_number').fill('GIFTCARD1234');
        await this.page.getByTestId('validation_code').fill('CODE123');

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