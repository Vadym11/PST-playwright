import { ProductDetails } from '@models/product-details';
import { BasePage } from '@pages/BasePage';
import { HeaderCommon } from '@pages/HeaderCommon';
import { Locator, Page, Response, expect } from '@playwright/test';

export class AdminProductCreationPage extends BasePage {
  readonly header: HeaderCommon;
  readonly nameInputField: Locator;
  readonly descriptionInputField: Locator;
  readonly stockInputField: Locator;
  readonly priceInputField: Locator;
  readonly locationOfferCheckBox: Locator;
  readonly itemForRentCheckbox: Locator;
  readonly co2RatingDropDown: Locator;
  readonly brandDropDown: Locator;
  readonly categoryDropDown: Locator;
  readonly imageDropDown: Locator;
  readonly saveButton: Locator;
  readonly backToProductsLink: Locator;
  toolImageName: string = '';

  constructor(page: Page) {
    super(page);
    this.nameInputField = page.getByLabel('Name');
    this.descriptionInputField = page.getByLabel('Description');
    this.stockInputField = page.getByLabel('Stock');
    this.priceInputField = page.getByLabel('Price');
    this.header = new HeaderCommon(page);
    this.locationOfferCheckBox = page.getByTestId('location-offer');
    this.itemForRentCheckbox = page.getByTestId('rental');
    this.co2RatingDropDown = page.getByTestId('co2-rating');
    this.brandDropDown = page.getByTestId('brand-id');
    this.categoryDropDown = page.getByTestId('category-id');
    this.imageDropDown = page.getByTestId('product-image-id');
    this.saveButton = page.getByRole('button', { name: 'Save' });
    this.backToProductsLink = page.getByRole('link', { name: 'Back' });
  }

  async enterProductDetails(product: ProductDetails): Promise<this> {
    await this.nameInputField.clear();
    await this.nameInputField.fill(product.name);
    await this.descriptionInputField.clear();
    await this.descriptionInputField.fill(product.description);
    await this.stockInputField.clear();
    await this.stockInputField.fill(product.stock.toString());
    await this.priceInputField.clear();
    await this.priceInputField.fill(product.price.toString());

    if (product.isLocationOffer) {
      await this.locationOfferCheckBox.check();
    }

    if (product.isItemForRent) {
      await this.itemForRentCheckbox.check();
    }

    // Select the CO2 rating only if it's not 'None' since it is
    // prepopulated with 'None' as the default option.
    if (product.co2Rating !== 'None') {
      await this.co2RatingDropDown.selectOption(product.co2Rating);
    }

    await this.brandDropDown.selectOption(product.brand);
    await this.categoryDropDown.selectOption(product.category);
    await this.imageDropDown.selectOption(product.image);

    return this;
  }

  async editProductNameAndStock(productName: string, stock: number): Promise<this> {
    await this.nameInputField.click({ clickCount: 3 });
    await this.nameInputField.pressSequentially(productName);
    console.log(await this.nameInputField.inputValue());
    await this.stockInputField.click({ clickCount: 3 });
    await this.stockInputField.pressSequentially(stock.toString());

    return this;
  }

  async clickSaveButton(): Promise<void> {
    this.toolImageName = await this.imageDropDown.inputValue();

    await this.saveButton.click();
  }

  async assertProductSavedMessage(): Promise<void> {
    const successMessage = this.page.getByText('Product saved!');
    await expect(successMessage).toBeVisible();
  }

  async assertProductImage(product: ProductDetails): Promise<void> {
    const toolImageName = await this.imageDropDown
      .locator(`option[value="${product.image}"]`)
      .innerText();

    await expect(this.page.getByAltText(toolImageName)).toBeVisible();
  }

  // additional methods to handle API response assertions for product creation
  async registerResponsePromise(): Promise<Response> {
    return this.page.waitForResponse((response) => {
      return (
        response.url().includes('/api/products') &&
        response.status() === 201 &&
        response.request().method() === 'POST'
      );
    });
  }

  // assert that the product details in the response match the expected product details
  async assertProductDetailsInResponse(
    createProductResponse: Response,
    product: ProductDetails,
  ): Promise<void> {
    const responseBody = await createProductResponse.json();

    expect(responseBody.name).toBe(product.name);
    expect(responseBody.description).toBe(product.description);
    expect(responseBody.stock).toBe(product.stock);
    expect(responseBody.price).toBe(product.price);
    expect(responseBody.is_location_offer).toBe(product.isLocationOffer);
    expect(responseBody.is_rental).toBe(product.isItemForRent);
    expect(responseBody.co2_rating).toBe(product.co2Rating);
    expect(responseBody.brand.id).toBe(product.brand);
    expect(responseBody.category.id).toBe(product.category);
    expect(responseBody.product_image.id).toBe(product.image);
  }
}
