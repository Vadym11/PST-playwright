import { Page } from '@playwright/test';
import { HeaderCommon } from './HeaderCommon';
import { BasePage } from './BasePage';
import { ProductPage } from './ProductPage';

export class HomePage extends BasePage {
  public readonly header: HeaderCommon;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderCommon(page);
  }

  async goTo(): Promise<HomePage> {
    await this.page.goto('/');

    return this;
  }

  async clickFirstProduct() {
    await this.page.getByTestId('product-name').first().click();

    return new ProductPage(this.page);
  }
}
