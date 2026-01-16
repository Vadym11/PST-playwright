import { Locator, Page } from '@playwright/test';
import { BasePage } from '../BasePage';
import { ShoppingCartBillingPage } from './ShoppingCartBillingPage';

export class ShoppingCartLoginPage extends BasePage {
  private readonly proceedToCheckoutButton: Locator;
  private readonly emailAddressField: Locator;
  private readonly passwordField: Locator;
  private readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.proceedToCheckoutButton = page.getByRole('button', { name: 'Proceed to checkout' });
    this.emailAddressField = page.getByTestId('email');
    this.passwordField = page.getByTestId('password');
    this.loginButton = page.getByTestId('login-submit');
  }

  async clickProceedToCheckout(): Promise<ShoppingCartBillingPage> {
    await this.proceedToCheckoutButton.click();

    return new ShoppingCartBillingPage(this.page);
  }

  async enterEmailAddress(email: string): Promise<this> {
    await this.emailAddressField.fill(email);

    return this;
  }

  async enterPassword(password: string): Promise<this> {
    await this.passwordField.fill(password);

    return this;
  }

  async clickLoginButton(): Promise<this> {
    await this.loginButton.click();

    return this;
  }

  async loginExistingUser(email: string, password: string): Promise<this> {
    await this.enterEmailAddress(email);
    await this.enterPassword(password);
    await this.clickLoginButton();

    return this;
  }
}
