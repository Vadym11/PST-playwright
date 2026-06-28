import { ProductDetails } from '@models/product-details';
import { BasePage } from '@pages/BasePage';
import { HeaderCommon } from '@pages/HeaderCommon';
import { Locator, Page, Response, expect } from '@playwright/test';

export class AdminProductCreationPage extends BasePage {
  readonly header: HeaderCommon;
  readonly productIdField: Locator;
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
    this.productIdField = page.getByLabel('Id');
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

  /**
   * Enters product details into the creation form to create a new product,
   * or the edit form for existing products if editMode is true.
   * @param product
   * @param editMode
   * @returns
   */
  async enterProductDetails(product: ProductDetails, editMode = false): Promise<this> {
    if (editMode) {
      await expect(this.nameInputField).not.toBeEmpty();
      await this.nameInputField.clear();
      await expect(this.nameInputField).toBeEmpty();
    }
    await this.nameInputField.fill(product.name);

    if (editMode) {
      await expect(this.descriptionInputField).not.toBeEmpty();
      await this.descriptionInputField.clear();
      await expect(this.descriptionInputField).toBeEmpty();
    }
    await this.descriptionInputField.fill(product.description);

    if (editMode) {
      if (!product.isItemForRent) {
        await expect(this.stockInputField).not.toBeEmpty();
        await this.stockInputField.clear();
        await expect(this.stockInputField).toBeEmpty();
      }
    }
    if (!product.isItemForRent && product.stock !== null) {
      await this.stockInputField.fill(product.stock.toString());
    }

    if (editMode) {
      await expect(this.priceInputField).not.toBeEmpty();
      await this.priceInputField.clear();
      await expect(this.priceInputField).toBeEmpty();
    }
    await this.priceInputField.fill(product.price.toString());

    if (product.isLocationOffer && !(await this.locationOfferCheckBox.isChecked())) {
      await this.locationOfferCheckBox.check();
    } else if (!product.isLocationOffer && (await this.locationOfferCheckBox.isChecked())) {
      await this.locationOfferCheckBox.uncheck();
    }

    if (product.isItemForRent && !(await this.itemForRentCheckbox.isChecked())) {
      await this.itemForRentCheckbox.check();
    } else if (!product.isItemForRent && (await this.itemForRentCheckbox.isChecked())) {
      await this.itemForRentCheckbox.uncheck();
    }

    // Select the CO2 rating only if it's not 'None' since it is
    // prepopulated with 'None' as the default option.
    if (product.co2Rating !== 'None' || editMode) {
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

  async assertSearchedProductDetails(product: ProductDetails): Promise<void> {
    await expect(this.productIdField).not.toBeEmpty();
    await expect(this.nameInputField).toHaveValue(product.name);
    await expect(this.descriptionInputField).toHaveValue(product.description);
    if (product.stock !== null) {
      await expect(this.stockInputField).toHaveValue(product.stock.toString());
    } else {
      await expect(this.stockInputField).toHaveValue('');
    }
    await expect(this.priceInputField).toHaveValue(product.price.toString());
    if (product.isLocationOffer) {
      await expect(this.locationOfferCheckBox).toBeChecked();
    } else {
      await expect(this.locationOfferCheckBox).not.toBeChecked();
    }
    if (product.isItemForRent) {
      await expect(this.itemForRentCheckbox).toBeChecked();
    } else {
      await expect(this.itemForRentCheckbox).not.toBeChecked();
    }
    await expect(this.co2RatingDropDown).toHaveValue(product.co2Rating);
    await expect(this.brandDropDown).toHaveValue(product.brand);
    await expect(this.categoryDropDown).toHaveValue(product.category);
    await expect(this.imageDropDown).toHaveValue(product.image);
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
