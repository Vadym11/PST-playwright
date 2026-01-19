import { Page } from '@playwright/test';
import { HeaderCommon } from './HeaderCommon';
import { BasePage } from './BasePage';
import { ProductPage } from './ProductPage';
import { faker } from '@faker-js/faker';

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

  async clickFirstProduct(): Promise<ProductPage> {
    await this.page.getByTestId('product-name').first().click();

    return new ProductPage(this.page);
  }

  async clickRandomPage(): Promise<HomePage> {
    const randomPage = faker.datatype.number({ min: 1, max: 5 }).toString();

    await this.page.getByRole('button', { name: randomPage }).click();

    return this;
  }

  async clickRandomProduct(): Promise<ProductPage> {
    const productCards = this.page.locator("//*[@class='card']");
    let inStockCount: number[] = [];

    const productsOnPageCount = await productCards.count();

    for (let i = 0; i < productsOnPageCount; i++) {
      const isOutOfStock = await productCards.nth(i).getByTestId('out-of-stock').isVisible();
      if (!isOutOfStock) {
        inStockCount.push(i);
      }
    }

    const randomProductNumber = faker.helpers.arrayElement(inStockCount);

    await productCards.nth(randomProductNumber).click();

    return new ProductPage(this.page);
  }

  async selectRandomProduct(): Promise<ProductPage> {
    await this.clickRandomPage();

    await this.clickRandomProduct();

    return new ProductPage(this.page);
  }
}
