import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';
import { HeaderCommon } from './HeaderCommon';

export class ProductPage extends BasePage {
  private readonly addToCartButton: Locator;
  readonly header: HeaderCommon;

  constructor(page: Page) {
    super(page);
    this.addToCartButton = page.getByTestId('add-to-cart');
    this.header = new HeaderCommon(page);
  }

  async clickAddToCart(count: number = 1): Promise<this> {
    await this.addToCartButton.click({clickCount: count, delay: 300});

    return this;
  }

  getAddedToCartPopUp(count: number = 1): Locator {
    // return this.page.getByRole('alert', {name: 'Pruduct added to shopping cart.'});
    // const popUps = this.page.locator("//div[@aria-label='Product added to shopping cart.']");
    // await expect(popUps).toHaveCount(count);

    return this.page.locator("//div[@aria-label='Product added to shopping cart.']").last();
  }

  async clickAddToCartAndAssertPopUps(count: number = 1): Promise<void> {
    for (let i = 0; i < count; i++ ) {
      await this.clickAddToCart();

      await expect(this.getAddedToCartPopUp()).toBeVisible();
    }
  }

  getCartQuantity(): Locator {
    return this.page.getByTestId(`cart-quantity`);
  }
}
