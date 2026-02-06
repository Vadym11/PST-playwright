import { Locator, Page } from '@playwright/test';
import { ShoppingCartMainPage } from '@pages/shoppingCart/ShoppingCartMainPage';
import { HomePage } from '@pages/HomePage';
import { ProfilePage } from './account/profilePage';
import { FavoritesPage } from './account/favoritesPage';

export class HeaderCommon {
  private readonly page: Page;
  private readonly mainBanner: Locator;
  private readonly signInLink: Locator;
  private readonly cartIcon: Locator;
  private readonly homePageLink: Locator;
  private readonly userNavMenu: Locator;
  private readonly profileLink: Locator;
  private readonly favoritesLink: Locator;
  private readonly signOutLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.mainBanner = this.page.getByTitle('Practice Software Testing - Toolshop');
    this.signInLink = this.page.getByTestId('nav-sign-in');
    this.cartIcon = this.page.getByTestId('nav-cart');
    this.homePageLink = this.page.getByTestId('nav-home');
    this.userNavMenu = this.page.getByTestId('nav-menu');
    this.signOutLink = this.page.getByTestId('nav-sign-out');
    this.profileLink = this.page.getByTestId('nav-my-profile');
    this.favoritesLink = this.page.getByTestId('nav-my-favorites');
  }

  async clickMainBanner(): Promise<void> {
    await this.mainBanner.click();
  }

  async clickSignInLink(): Promise<void> {
    await this.signInLink.click();
  }

  async clickFavoritesLink(): Promise<FavoritesPage> {
    await this.favoritesLink.click();

    return new FavoritesPage(this.page);
  }

  async clickUserNavMenu() {
    await this.userNavMenu.click();

    return this;
  }

  async clickProfileLink(): Promise<ProfilePage> {
    await this.profileLink.click();

    return new ProfilePage(this.page);
  }

  async goToProfilePage(): Promise<ProfilePage> {
    await this.clickUserNavMenu();
    await this.clickProfileLink();

    return new ProfilePage(this.page);
  }

  async goToFavoritesPage(): Promise<FavoritesPage> {
    await this.clickUserNavMenu();
    await this.clickFavoritesLink();

    return new FavoritesPage(this.page);
  }

  async clickSignOut() {
    await this.signOutLink.click();
  }

  async signOut() {
    await this.clickUserNavMenu();
    await this.clickSignOut();

    return this;
  }

  async clickCartIcon(): Promise<ShoppingCartMainPage> {
    await this.cartIcon.click();

    return new ShoppingCartMainPage(this.page);
  }

  async clickHomePageLink(): Promise<HomePage> {
    // this is needed to ensure the page has fully loaded after signing in and before clicking the link
    await this.page.waitForLoadState('networkidle');
    await this.homePageLink.click();

    return new HomePage(this.page);
  }
}
