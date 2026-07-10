import { BasePage } from '@pages/BasePage';
import { HeaderCommon } from '@pages/HeaderCommon';
import { Locator, Page, expect } from '@playwright/test';
import { AdminProductCreationPage } from './AdminProductCreationPage';
import { ProductDetails } from '@models/product-details';

export class AdminProductsPage extends BasePage {
  readonly header: HeaderCommon;
  readonly productsTitle: Locator;
  readonly productsTable: Locator;
  readonly pagination: Locator;
  readonly addProductButton: Locator;
  readonly searchProductBar: Locator;
  readonly searchProductButton: Locator;
  readonly resetSearchButton: Locator;

  constructor(page: Page) {
    super(page);
    this.productsTitle = page.getByTestId('page-title');
    this.productsTable = page.getByRole('table');
    this.pagination = page.locator('.pagination');
    this.addProductButton = page.getByRole('link', { name: 'Add Product' });
    this.searchProductBar = page.getByTestId('product-search-query');
    this.searchProductButton = page.getByRole('button', { name: 'Search' });
    this.resetSearchButton = page.getByRole('button', { name: 'Reset' });
    this.header = new HeaderCommon(page);
  }

  async open(): Promise<this> {
    await this.page.goto('/admin/products');

    return this;
  }

  async clickAddProductButton(): Promise<AdminProductCreationPage> {
    await this.addProductButton.click();

    return new AdminProductCreationPage(this.page);
  }

  async searchProduct(productName: string): Promise<void> {
    await this.searchProductBar.fill(productName);
    await this.searchProductButton.click();
  }

  async resetSearch(): Promise<void> {
    await this.resetSearchButton.click();
  }

  async clickEditProduct(productName: string): Promise<AdminProductCreationPage> {
    const productRow = this.productsTable.locator('tbody tr').filter({ hasText: productName });
    await expect(productRow).toHaveCount(1);

    const editButton = productRow.getByRole('link', { name: 'Edit' });
    await editButton.click();

    return new AdminProductCreationPage(this.page);
  }

  async clickDeleteProduct(productName: string): Promise<AdminProductsPage> {
    const productRow = this.productsTable.locator('tbody tr').filter({ hasText: productName });
    await expect(productRow).toHaveCount(1);

    const deleteButton = productRow.getByRole('button', { name: 'Delete' });
    await deleteButton.click();

    return this;
  }

  async assertProductDeletedMessage(): Promise<void> {
    await expect(this.page.getByRole('alert', { name: 'Product deleted.' }).last()).toBeVisible();
  }

  async assertPagination(): Promise<void> {
    await expect(this.pagination).toBeVisible();
    // assert that the first page is active by checking the text of the active page item and its class
    await expect(this.pagination.locator('li.page-item.active')).toHaveText('1');
  }

  async assertProductsTable(): Promise<void> {
    await expect(this.productsTitle).toBeVisible();
    await expect(this.productsTable).toBeVisible();

    const tableColumnNamesExpected = ['Id', 'Name', 'Stock', 'Price', ''];

    await expect(this.productsTable.locator('thead tr th')).toHaveText(tableColumnNamesExpected);

    const rowLocators = this.productsTable.locator('tbody tr');
    await expect(rowLocators).not.toHaveCount(0);
    const rowCount = await rowLocators.count();

    for (let i = 0; i < rowCount; i++) {
      const cells = rowLocators.nth(i).locator('td');

      await expect(cells).toHaveCount(5);

      await expect(cells.nth(0)).toHaveText(/^[0-9A-Z]{26}$/);
      await expect(cells.nth(1)).toContainText(/\S{2,}/);
      await expect(cells.nth(2)).toHaveText(/\d+/);
      await expect(cells.nth(3)).toHaveText(/^\$\d+\.\d{2}/);

      await expect(cells.nth(4).getByRole('link', { name: 'Edit' })).toBeVisible();
      await expect(cells.nth(4).getByRole('button', { name: 'Delete' })).toBeVisible();
    }
  }

  async assertProductManagementBlock(): Promise<void> {
    await expect(this.addProductButton).toBeVisible();
    await expect(this.searchProductBar).toBeVisible();
    await expect(this.searchProductButton).toBeVisible();
    await expect(this.resetSearchButton).toBeVisible();
  }

  async assertAdminProductsPage(): Promise<void> {
    await this.assertProductManagementBlock();
    await this.assertProductsTable();
    await this.assertPagination();
  }

  private getSearchedRowLocator(product: ProductDetails): Locator {
    const rowLocators = this.productsTable.locator('tbody tr');
    const searchedProductRow = rowLocators
      .filter({ hasText: product.name })
      .filter({ hasText: product.stock?.toString() ?? '' })
      .filter({ hasText: `$${product.price.toFixed(2)}` });

    return searchedProductRow;
  }

  private getTableRows(): Locator {
    return this.productsTable.locator('tbody tr');
  }

  async assertSearchedProductRow(product: ProductDetails): Promise<void> {
    const rowLocators = this.getTableRows();
    await expect(rowLocators).not.toHaveCount(0);
    const searchedProductRow = this.getSearchedRowLocator(product);

    await expect(searchedProductRow).toHaveCount(1);
  }

  async assertNoProductsFound(product: ProductDetails): Promise<void> {
    const searchedProductRow = this.getSearchedRowLocator(product);

    await expect(searchedProductRow).toHaveCount(0);
  }
}
