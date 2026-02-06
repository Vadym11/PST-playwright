import { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { HeaderCommon } from '@pages/HeaderCommon';
import { ProfilePage } from './account/profilePage';

export class MyAccountPage extends BasePage {
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

  async clickProfile(): Promise<ProfilePage> {
    await this.profileLink.click();

    return new ProfilePage(this.page);
  }
  async clickInvoices() {
    await this.invoicesLink.click();
  }

  async clickMessages() {
    await this.messagesLink.click();
  }
}
