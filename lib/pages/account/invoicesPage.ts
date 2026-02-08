import { GetProductResponse } from '@models/api-product';
import { CreateUser } from '@models/api-user';
import { BasePage } from '@pages/BasePage';
import { expect, Locator, Page } from '@playwright/test';

export class InvoicesPage extends BasePage {
  private readonly invoicesTable: Locator;

  constructor(page: Page) {
    super(page);
    this.invoicesTable = page.getByRole('table');
  }

  async getInvoiceLineItems(
    invoiceNumber: string,
  ): Promise<{ billingAddress: string; invoiceDate: string; amount: string; detailsBtn: Locator }> {
    const rows = this.invoicesTable.getByRole('row');
    const targetRow = rows.filter({ hasText: invoiceNumber });

    return {
      billingAddress: (await targetRow.locator('td').nth(1).textContent()) || '',
      invoiceDate: (await targetRow.locator('td').nth(2).textContent()) || '',
      amount: (await targetRow.locator('td').nth(3).textContent()) || '',
      detailsBtn: targetRow.locator('a', { hasText: 'Details' }),
    };
  }

  async verifyInvoiceLineItems(
    user: CreateUser,
    productInfo: GetProductResponse,
    quantity: number,
  ): Promise<void> {
    const finalPrice = productInfo.is_eco_friendly ? productInfo.price * 0.95 : productInfo.price;
    const invoiceDate = new Date().toLocaleDateString('en-CA'); // format the date as YYYY-MM-DD\
    const totalAmount = (finalPrice * quantity).toFixed(2);
    const invoiceInfo = await this.getInvoiceLineItems(''); // Pass the actual invoice number here

    expect(invoiceInfo.billingAddress).toBe(user.address.street);
    expect(invoiceInfo.invoiceDate).toContain(invoiceDate); // format the date as YYYY-MM-DD
    expect(invoiceInfo.amount).toBe(`$${totalAmount}`);
  }
}
