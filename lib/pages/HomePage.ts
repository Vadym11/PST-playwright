import { Page } from '@playwright/test';
import { HeaderCommon } from '@pages/HeaderCommon';
import { BasePage } from '@pages/BasePage';
import { ProductPage } from '@pages/ProductPage';
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

  async filterEcoProducts(): Promise<HomePage> {
    await this.page.getByTestId('eco-friendly-filter').click();

    return this;
  }

  async clickFirstProduct(): Promise<ProductPage> {
    await this.page.getByTestId('product-name').first().click();

    return new ProductPage(this.page);
  }

  async clickRandomPage(): Promise<HomePage> {
    const randomPage = faker.datatype.number({ min: 1, max: 5 }).toString();

    if (randomPage === '1') {
      await this.page.reload();
      return this;
    }

    await this.page.getByRole('button', { name: randomPage }).click();

    return this;
  }

  async clickRandomProductDeprecated(): Promise<ProductPage> {
    const productCards = await this.page.locator("//*[@class='card']").all();
    let inStockCount: number[] = [];

    const productsOnPageCount = productCards.length;

    for (let i = 0; i < productsOnPageCount; i++) {
      const isOutOfStock = await productCards[i].getByTestId('out-of-stock').isVisible();
      const title = await productCards[i].locator('h5').textContent();
      if (!isOutOfStock && title !== 'Thor Hammer') {
        inStockCount.push(i);
      }
    }

    const randomProductNumber = faker.helpers.arrayElement(inStockCount);

    await productCards[randomProductNumber].click();

    return new ProductPage(this.page);
  }

  async clickRandomProduct(): Promise<ProductPage> {
    await this.page.waitForLoadState('networkidle');
    // 1. Define the base locator for all cards
    const allCards = this.page.locator('.card');

    // 2. Chain filters to find only valid, in-stock products
    const availableProducts = allCards
      .filter({
        hasNot: this.page.getByTestId('out-of-stock'),
      })
      .filter({
        hasNotText: 'Thor Hammer',
      });

    // 3. Convert to an array of locators
    const productList = await availableProducts.all();

    // 4. Guard against empty results
    if (productList.length === 0) {
      throw new Error('No available products found matching criteria.');
    }

    // 5. Pick and click
    const randomProduct = faker.helpers.arrayElement(productList);
    await randomProduct.click();

    return new ProductPage(this.page);
  }

  async selectRandomProduct(): Promise<ProductPage> {
    await this.clickRandomPage();

    return this.clickRandomProduct();
  }
}
