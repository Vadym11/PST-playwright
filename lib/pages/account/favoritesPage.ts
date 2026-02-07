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

  async getProductCardsInFavorites(): Promise<Locator[]> {
    const productCards = this.page.locator('//*[contains(@class, "card-body")]');

    return productCards.all();
  }

  async verifyProductInFavorites(expectedProduct: GetProductResponse): Promise<void> {
    await this.page.waitForLoadState('networkidle'); // Ensure the page has fully loaded

    const favorites = await this.getProductCardsInFavorites();

    for (const favorite of favorites) {
      const productName = await favorite.getByTestId('product-name').textContent();

      if (productName?.trim() === expectedProduct.name.trim()) {
        const productDescription = await favorite.getByTestId('product-description').textContent();

        // describe the product description in the same way as it is done on the frontend (remove ellipsis and trim)
        const productDescriptionShort = productDescription?.replace('...', '').trim() || '';

        expect(expectedProduct.description).toContain(productDescriptionShort);

        return; // Product found, exit the function
      }
    }

    throw new Error(`Product with name "${expectedProduct.name}" not found in favorites.`);
  }
}
