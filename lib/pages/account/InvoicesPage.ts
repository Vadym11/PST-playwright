import { GetProductResponse } from '@models/api-product';
import { CreateUser } from '@models/api-user';
import { BasePage } from '@pages/BasePage';
import { expect, Locator, Page } from '@playwright/test';
import { assertWithinMargin } from '@utils/test-utils';
export class InvoicesPage extends BasePage {
  private readonly invoicesTable: Locator;

  constructor(page: Page) {
    super(page);
    this.invoicesTable = page.getByRole('table');
  }

  async getInvoiceLineItems(invoiceNumber: string): Promise<{
    billingAddress: string;
    invoiceDate: string;
    amount: string;
    detailsBtn: Locator;
    amountLocator: Locator;
  }> {
    const rows = this.invoicesTable.getByRole('row');
    const targetRow = rows.filter({ hasText: invoiceNumber });

    return {
      billingAddress: (await targetRow.locator('td').nth(1).textContent()) || '',
      invoiceDate: (await targetRow.locator('td').nth(2).textContent()) || '',
      amount: (await targetRow.locator('td').nth(3).textContent()) || '',
      detailsBtn: targetRow.locator('a', { hasText: 'Details' }),
      amountLocator: targetRow.locator('td').nth(3),
    };
  }

  async verifyInvoiceLineItems(
    user: CreateUser,
    productInfo: GetProductResponse,
    quantity: number,
    invoiceNumber: string,
  ): Promise<void> {
    const expectedFinalPrice = productInfo.is_eco_friendly
      ? productInfo.price * 0.95
      : productInfo.price;
    const expectedInvoiceDate = new Date().toLocaleDateString('en-CA');
    const expectedTotalAmount = (expectedFinalPrice * quantity).toFixed(2);
    const invoiceInfo = await this.getInvoiceLineItems(invoiceNumber);

    expect(invoiceInfo.billingAddress).toBe(user.address.street);
    expect(invoiceInfo.invoiceDate).toContain(expectedInvoiceDate);
    const actualTotalAmountLocator = invoiceInfo.amountLocator;
    await assertWithinMargin(actualTotalAmountLocator, parseFloat(expectedTotalAmount));
  }
}
