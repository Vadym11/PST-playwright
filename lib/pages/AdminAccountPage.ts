import { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { HeaderCommon } from '@pages/HeaderCommon';
export class AdminAccountPage extends BasePage {
  readonly header: HeaderCommon;
  readonly myAccountTitle: Locator;
  readonly favoritesLink: Locator;
  readonly profileLink: Locator;
  readonly invoicesLink: Locator;
  readonly messagesLink: Locator;

  constructor(page: Page) {
    super(page);
    this.myAccountTitle = page.getByTestId('page-title');
    this.favoritesLink = page.getByTestId('nav-favorites');
    this.profileLink = page.getByTestId('nav-profile');
    this.invoicesLink = page.getByTestId('nav-invoices');
    this.messagesLink = page.getByTestId('nav-messages');
    this.header = new HeaderCommon(page);
  }

  async clickFavorites() {
    await this.favoritesLink.click();
  }

  async clickProfileLink(): Promise<this> {
    await this.profileLink.click();

    return this;
  }

  async clickSignOut() {
    await this.header.signOut();
  }

  async clickInvoices() {
    await this.invoicesLink.click();
  }

  async clickMessages() {
    await this.messagesLink.click();
  }
}
