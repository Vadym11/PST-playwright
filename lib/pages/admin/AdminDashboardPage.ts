import { BasePage } from '@pages/BasePage';
import { HeaderCommon } from '@pages/HeaderCommon';
import { Locator, Page, expect } from '@playwright/test';
import { isValidInvoiceDate } from '@utils/test-utils';

export class AdminDashboardPage extends BasePage {
  readonly header: HeaderCommon;
  readonly salesTitle: Locator;
  readonly latestOrdersTitle: Locator;
  readonly latestOrdersTable: Locator;
  readonly pagination: Locator;

  constructor(page: Page) {
    super(page);
    this.salesTitle = page.getByTestId('page-title');
    this.latestOrdersTitle = page.getByRole('heading', { name: 'Latest orders' });
    this.latestOrdersTable = page.getByRole('table');
    this.pagination = page.locator('.pagination');
    this.header = new HeaderCommon(page);
  }

  async open(): Promise<this> {
    await this.page.goto('/admin/dashboard');

    return this;
  }

  async assertSalesGraphTitle(): Promise<void> {
    await expect(this.salesTitle).toBeVisible();
  }

  async assertPagination(): Promise<void> {
    await expect(this.pagination).toBeVisible();
    // assert that the first page is active by checking the text of the active page item and its class
    await expect(this.pagination.locator('li.page-item.active')).toHaveText('1');
    // this is an alternative way to assert that the first page is active by checking the aria-label of the active page item
    // await expect(this.pagination.getByLabel('Page-1', { exact: true }).locator('..')).toHaveClass(/active/);
  }

  async assertLatestOrdersTable(): Promise<void> {
    await expect(this.latestOrdersTitle).toBeVisible();
    await expect(this.latestOrdersTable).toBeVisible();

    const tableColumnNamesExpected = [
      'Invoice Number',
      'Billing Address',
      'Invoice Date',
      'Status',
      'Total',
      '',
    ];

    await expect(this.latestOrdersTable.locator('thead tr th')).toHaveText(
      tableColumnNamesExpected,
    );

    const orderStatusesExpected = [
      'AWAITING_FULFILLMENT',
      'ON_HOLD',
      'AWAITING_SHIPMENT',
      'SHIPPED',
      'COMPLETED',
    ];
    const statusRegex = new RegExp(`^(${orderStatusesExpected.join('|')})$`);

    const rowLocators = this.latestOrdersTable.locator('tbody tr');
    await expect(rowLocators).not.toHaveCount(0);
    const rowCount = await rowLocators.count();

    for (let i = 0; i < rowCount; i++) {
      const cells = rowLocators.nth(i).locator('td');

      await expect(cells).toHaveCount(6);

      await expect(cells.nth(0)).toContainText(/^INV-\d+/);
      await expect(cells.nth(1)).not.toBeEmpty();

      const dateCell = cells.nth(2);
      await expect(dateCell).toHaveText(/\S+/);
      const dateCellContent = await dateCell.innerText();
      expect(
        isValidInvoiceDate(dateCellContent),
        `Expected valid invoice date but got: "${dateCellContent}"`,
      ).toBeTruthy();

      await expect(cells.nth(3)).toHaveText(statusRegex);

      await expect(cells.nth(4)).toHaveText(/^\$\d+\.\d{2}/);

      await expect(cells.nth(5).getByRole('link', { name: 'Edit' })).toBeVisible();
    }

    // Below is less reliable way to validate table content, but it is more concise and easier to maintain,
    // so it can be used as an alternative to the above approach

    // This ensures the table is not empty and has at least one row
    // since looping through an empty table would not execute any assertions and give a false positive result
    // await expect(this.latestOrdersTable.locator('tbody tr')).not.toHaveCount(0);
    // const tableRows = await this.latestOrdersTable.locator('tbody tr').all();

    // for (const row of tableRows) {
    //     const cellLocator = row.locator('td');

    //     await expect(cellLocator).toHaveCount(6);
    //     const rowCells = await cellLocator.all();

    //     await expect(rowCells[0]).toContainText(/^INV-\d+/);
    //     await expect(rowCells[1]).not.toBeEmpty();
    //     // await expect(rowCells[2]).toHaveText(/\d{4}-\d{2}-\d{2}/);

    //     // wait until cell has any non-empty text
    //     await expect(rowCells[2]).toHaveText(/\S+/);
    //     const dateText = await rowCells[2].textContent() || '';
    //     expect(isValidInvoiceDate(dateText.trim()), `Expected valid invoice date but got: "${dateText}"`).toBeTruthy();
    //     await expect(rowCells[3]).toHaveText(statusRegex);
    //     await expect(rowCells[4]).toHaveText(/^\$\d+\.\d{2}/);
    // }
  }

  async assertAdminDashboard(): Promise<void> {
    await this.assertSalesGraphTitle();
    await this.assertLatestOrdersTable();
    await this.assertPagination();
  }
}
