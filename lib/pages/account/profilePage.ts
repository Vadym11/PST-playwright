import { CreateUser } from '@models/api-user';
import { BasePage } from '@pages/BasePage';
import { HeaderCommon } from '@pages/HeaderCommon';
import { expect, Locator, Page } from '@playwright/test';

export class ProfilePage extends BasePage {
  readonly profileTitle: Locator;
  readonly header: HeaderCommon;
  private readonly firstName: Locator;
  private readonly lastName: Locator;
  private readonly email: Locator;
  private readonly phone: Locator;
  private readonly street: Locator;
  private readonly city: Locator;
  private readonly postalCode: Locator;
  private readonly country: Locator;
  private readonly state: Locator;

  constructor(page: Page) {
    super(page);
    this.header = new HeaderCommon(page);
    this.profileTitle = page.getByTestId('page-title');
    this.firstName = page.getByLabel('First name');
    this.lastName = page.getByLabel('Last name');
    this.email = page.getByLabel('Email address');
    this.phone = page.getByLabel('Phone');
    this.street = page.getByLabel('Street');
    this.city = page.getByLabel('City');
    this.postalCode = page.getByLabel('Postal code');
    this.country = page.getByLabel('Country');
    this.state = page.getByLabel('State');
  }

  async assertProfileInfo(userInfo: CreateUser): Promise<void> {
    await expect(this.profileTitle).toBeVisible();

    await expect(this.firstName).toHaveValue(userInfo.first_name);
    await expect(this.lastName).toHaveValue(userInfo.last_name);
    await expect(this.email).toHaveValue(userInfo.email);
    await expect(this.phone).toHaveValue(userInfo.phone);
    await expect(this.street).toHaveValue(userInfo.address.street);
    await expect(this.city).toHaveValue(userInfo.address.city);
    await expect(this.postalCode).toHaveValue(userInfo.address.postal_code);
    await expect(this.country).toHaveValue(userInfo.address.country);
    await expect(this.state).toHaveValue(userInfo.address.state);
  }
}
