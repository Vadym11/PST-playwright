import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { HeaderCommon } from '@pages/HeaderCommon';
import { ProductAPI } from '@api-models/product';
import { GetProductResponse } from '@models/api-product';

export class ProductPage extends BasePage {
  private readonly addToCartButton: Locator;
  private readonly addToFavoritesButton: Locator;
  readonly header: HeaderCommon;

  constructor(page: Page) {
    super(page);
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.addToFavoritesButton = page.getByTestId('add-to-favorites');
    this.header = new HeaderCommon(page);
  }

  async clickAddToCart(count: number = 1): Promise<this> {
    await this.addToCartButton.click({ clickCount: count, delay: 300 });

    return this;
  }

  getAddedToCartPopUp(): Locator {
    return this.page.getByRole('alert', { name: 'Product added to shopping cart.' }).last();
  }

  async clickAddToCartAndAssertPopUps(count: number = 1): Promise<void> {
    for (let i = 0; i < count; i++) {
      await this.clickAddToCart();

      await expect(this.getAddedToCartPopUp()).toBeVisible();
    }
  }

  getCartQuantity(): Locator {
    return this.page.getByTestId(`cart-quantity`);
  }

  async clickAddToFavorites(): Promise<this> {
    await this.addToFavoritesButton.click();

    return this;
  }

  async getCurrentProductId(): Promise<string> {
    const url = this.page.url();
    const productId = url.split('/').pop() || '';

    return productId;
  }

  async getCurrentProductInfoById(productApi: ProductAPI): Promise<GetProductResponse> {
    const productId = await this.getCurrentProductId();

    const productInfo = await productApi.getById(productId);

    return productInfo;
  }

  getAddedToFavoritesPopUp(): Locator {
    return this.page.getByRole('alert', { name: 'Product added to your favorites list.' });
  }
}
