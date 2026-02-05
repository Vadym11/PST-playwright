import { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { ShoppingCartLoginPage } from '@pages/shoppingCart/ShoppingCartLoginPage';

export class ShoppingCartMainPage extends BasePage {
  private readonly proceedToCheckoutButton: Locator;
  constructor(page: Page) {
    super(page);
    this.proceedToCheckoutButton = page.getByRole('button', { name: 'Proceed to checkout' });
  }

  async clickProceedToCheckout(): Promise<ShoppingCartLoginPage> {
    await this.proceedToCheckoutButton.click();

    return new ShoppingCartLoginPage(this.page);
  }
}
