import { GetProductResponse } from '@models/api-product';
import { BasePage } from '@pages/BasePage';
import { HeaderCommon } from '@pages/HeaderCommon';
import { expect, Locator, Page } from '@playwright/test';

export class FavoritesPage extends BasePage {
  readonly favoritesTitle: Locator;
  readonly header: HeaderCommon;

  constructor(page: Page) {
    super(page);
    this.favoritesTitle = page.getByTestId('favorites-title');
    this.header = new HeaderCommon(page);
  }

  async getProductCardsInFavorites(): Promise<Locator> {
    const productCards = this.page.locator('//*[contains(@class, "card-body")]');

    return productCards;
  }

  async verifyProductInFavorites(expectedProduct: GetProductResponse): Promise<void> {
    const favorites = await this.getProductCardsInFavorites();
    const targetRow = favorites.filter({ hasText: expectedProduct.name });
    await expect(targetRow).toHaveCount(1);

    const productDescription = await targetRow.getByTestId('product-description').textContent();

    if (productDescription !== null) {
      const productDescriptionShort = productDescription.replace('...', '').trim();

      expect(expectedProduct.description).toContain(productDescriptionShort);

      return;
    }

    throw new Error(`Product description for "${expectedProduct.name}" not found in favorites.`);
  }
}
