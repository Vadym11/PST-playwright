import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { CreateUser } from '@models/api-user';
import { GetProductResponse } from '@models/api-product';
import { assertWithinMargin } from '@utils/test-utils';

export class InvoiceDetailsPage extends BasePage {
  readonly invoiceNumber: Locator;
  readonly invoiceDate: Locator;
  readonly total: Locator;
  readonly street: Locator;
  readonly postalCode: Locator;
  readonly city: Locator;
  readonly state: Locator;
  readonly country: Locator;
  readonly paymentMethod: Locator;
  readonly invoiceTable: Locator;
  readonly todaysDate = new Date().toLocaleDateString('en-CA'); // format the date as YYYY-MM-DD\

  constructor(page: Page) {
    super(page);
    this.invoiceNumber = this.page.getByTestId('invoice-number');
    this.invoiceDate = this.page.getByTestId('invoice-date');
    this.total = this.page.locator('#total');
    this.street = this.page.getByTestId('street');
    this.postalCode = this.page.getByTestId('postal_code');
    this.city = this.page.getByTestId('city');
    this.state = this.page.getByTestId('state');
    this.country = this.page.getByTestId('country');
    this.paymentMethod = this.page.getByTestId('payment-method');
    this.invoiceTable = this.page.getByRole('table');
  }

  calculatePrices(productInfo: GetProductResponse, quantity: number) {
    const finalPrice = productInfo.is_eco_friendly ? productInfo.price * 0.95 : productInfo.price;
    const totalAmount = parseFloat((finalPrice * quantity).toFixed(2));
    const discount = productInfo.is_eco_friendly
      ? parseFloat(((productInfo.price - finalPrice) * quantity).toFixed(2))
      : 0;
    const fullTotal = parseFloat((productInfo.price * quantity).toFixed(2));

    return { finalPrice, totalAmount, discount, fullTotal };
  }

  async verifyGeneralInfo(
    productInfo: GetProductResponse,
    quantity: number,
    invoiceNumber: string,
  ): Promise<void> {
    const calculatedPrices = this.calculatePrices(productInfo, quantity);

    if (calculatedPrices.discount !== 0) {
      await assertWithinMargin(this.page.locator('#subtotal'), calculatedPrices.fullTotal);
      await assertWithinMargin(this.page.locator('#eco_discount'), calculatedPrices.discount);
    }

    await assertWithinMargin(this.total, calculatedPrices.totalAmount);
    await expect(this.invoiceNumber).toHaveValue(invoiceNumber);
    await expect(this.invoiceDate).toHaveValue(new RegExp(`^${this.todaysDate}`));
  }

  async verifyBillingAddress(user: CreateUser): Promise<void> {
    await expect(this.street).toHaveValue(user.address.street);
    await expect(this.postalCode).toHaveValue(user.address.postal_code);
    await expect(this.city).toHaveValue(user.address.city);
    await expect(this.state).toHaveValue(user.address.state);
    await expect(this.country).toHaveValue(user.address.country);
  }

  async verifyInvoiceLineItems(productInfo: GetProductResponse, quantity: number): Promise<void> {
    const calculatedPrices = this.calculatePrices(productInfo, quantity);
    const rows = this.invoiceTable.getByRole('row');
    const nameRegex = new RegExp(`${productInfo.name}.*`, 'i');
    const targetRow = rows.filter({ hasText: nameRegex });

    await expect(targetRow).toBeVisible();

    await assertWithinMargin(targetRow.locator('td').nth(3), calculatedPrices.fullTotal);

    await expect(targetRow.locator('td').nth(0)).toContainText(quantity.toString());
    await expect(targetRow.locator('td').nth(1)).toContainText(productInfo.name);
    await expect(targetRow.locator('td').nth(2)).toContainText(productInfo.price.toString());
  }

  async verifyPaymentMethod(paymentMethod: string): Promise<void> {
    await expect(this.paymentMethod).toHaveValue(paymentMethod);
  }

  async verifyInvoiceDetails(
    productInfo: GetProductResponse,
    invoiceNumber: string,
    user: CreateUser,
    quantity: number,
    paymentMethod: string,
  ): Promise<void> {
    await this.verifyGeneralInfo(productInfo, quantity, invoiceNumber);
    await this.verifyBillingAddress(user);
    await this.verifyInvoiceLineItems(productInfo, quantity);
    await this.verifyPaymentMethod(paymentMethod);
  }
}
