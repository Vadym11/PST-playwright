import { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { HeaderCommon } from '@pages/HeaderCommon';
import { faker } from '@faker-js/faker';

export class ShoppingCartPaymentPage extends BasePage {
  private readonly choosePaymentMethodMenu: Locator;
  private readonly confirmButon: Locator;
  private readonly paymentSuccessMessage: Locator;
  private readonly invoiceMessage: Locator;
  readonly header: HeaderCommon;

  constructor(page: Page) {
    super(page);
    this.choosePaymentMethodMenu = page.getByTestId('payment-method');
    this.confirmButon = page.getByRole('button', { name: 'Confirm' });
    this.paymentSuccessMessage = page.getByTestId('payment-success-message');
    this.invoiceMessage = page.locator("[id='order-confirmation']");
    this.header = new HeaderCommon(page);
  }

  async openPaymentMethodsDropdownMenu(): Promise<this> {
    await this.choosePaymentMethodMenu.click();

    return this;
  }

  async selectBankTransferAndFillDetails(): Promise<this> {
    const bankAccountName = faker.finance.accountName();
    const bankAccountNumber = faker.finance.account(10);
    const bankName = `${faker.company.name().replaceAll(/[-,]/g, '')} Bank`;

    await this.choosePaymentMethodMenu.selectOption({ value: 'bank-transfer' });

    await this.page.getByTestId('bank_name').fill(bankName);
    await this.page.getByTestId('account_name').fill(bankAccountName);
    await this.page.getByTestId('account_number').fill(bankAccountNumber);

    return this;
  }

  async selectCashOnDeliveryOption(): Promise<this> {
    await this.choosePaymentMethodMenu.selectOption({ value: 'cash-on-delivery' });

    return this;
  }

  async selectCreditCardAndFillDetails(cardHolderName: string): Promise<this> {
    const creditCardNumber = faker.finance.creditCardNumber('####-####-####-####');
    const cvv = faker.finance.creditCardCVV();
    const expDate = new Intl.DateTimeFormat('en-US', {
      month: '2-digit',
      year: 'numeric',
    }).format(faker.date.future());

    await this.choosePaymentMethodMenu.selectOption({ value: 'credit-card' });

    await this.page.getByTestId('credit_card_number').fill(creditCardNumber);
    await this.page.getByTestId('expiration_date').fill(expDate);
    await this.page.getByTestId('cvv').fill(cvv);
    await this.page.getByTestId('card_holder_name').fill(cardHolderName);

    return this;
  }

  async selectBuyNowPayLater(): Promise<this> {
    const option = faker.helpers.arrayElement(['3', '6', '9', '12']);

    await this.choosePaymentMethodMenu.selectOption({ value: 'buy-now-pay-later' });

    await this.page.getByTestId('monthly_installments').selectOption({ value: option });

    return this;
  }

  async selectGiftCard(): Promise<this> {
    const giftCardNumber = `GIFTCARD${faker.random.alphaNumeric(6).toUpperCase()}`;
    const giftCardCode = `CODE${faker.random.alphaNumeric(6).toUpperCase()}`;

    await this.choosePaymentMethodMenu.selectOption({ value: 'gift-card' });

    await this.page.getByTestId('gift_card_number').fill(giftCardNumber);
    await this.page.getByTestId('validation_code').fill(giftCardCode);

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
