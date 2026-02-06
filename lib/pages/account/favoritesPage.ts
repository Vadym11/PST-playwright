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
    const productCards = this.page.locator('//*[@class="card-body"]');

    // const productNames = await productNameElements.allTextContents();

    return productCards.all();
  }

  async verifyProductInFavorites(expectedProduct: GetProductResponse): Promise<void> {
    const favorites = await this.getProductCardsInFavorites();

    for (const favorite of favorites) {
      const productName = await favorite.getByTestId('product-name').textContent();

      if (productName?.trim() === expectedProduct.name.trim()) {
        // expect(favorite.getByTestId('product-description')).toBe(expectedProduct.description);
        // expect(favorite.getByTestId('product-description')).toBe(expectedProduct.description);

        const productDescription = await favorite.getByTestId('product-description').textContent();

        expect(expectedProduct.description).toContain(
          productDescription?.replace('...', '').trim() || '',
        );

        return; // Product found, exit the function
      }
    }

    throw new Error(`Product with name "${expectedProduct.name}" not found in favorites.`);
  }
}
