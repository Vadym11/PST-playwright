import { expect, Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { ProductPage } from '@pages/ProductPage';

function normalizePrice(value: string): number {
  return Number(value.replace(/[^\d.]/g, ''));
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export class ProductCataloguePage extends BasePage {
  readonly searchInput: Locator;
  readonly searchButton: Locator;
  readonly sortDropdown: Locator;
  readonly productNameItems: Locator;
  readonly productPriceItems: Locator;
  readonly noResultsMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.searchInput = this.page.getByRole('textbox', { name: 'Search' });
    this.searchButton = this.page.getByRole('button', { name: 'Search' });
    this.sortDropdown = this.page.getByRole('combobox', { name: 'sort' });
    this.productNameItems = this.page.getByTestId('product-name');
    this.productPriceItems = this.page.getByTestId('product-price');
    this.noResultsMessage = this.page.getByText(
      /there are no products found|no products found|no results/i,
    );
  }

  async open(): Promise<this> {
    await this.page.goto('/');

    return this;
  }

  async assertListingLoaded(): Promise<this> {
    await expect(this.page).toHaveURL('/');
    await expect(this.productNameItems.first()).toBeVisible();
    await expect(this.productPriceItems.first()).toBeVisible();
    await expect(this.page.getByRole('button', { name: /^1$|^Page-1$/ })).toBeVisible();

    return this;
  }

  async filterByCategory(categoryName: string): Promise<this> {
    const categoryCheckbox = this.page.getByRole('checkbox', {
      name: new RegExp(`^${escapeRegExp(categoryName)}$`, 'i'),
    });

    await categoryCheckbox.check();

    return this;
  }

  async assertCategoryFilterActive(categoryName: string): Promise<this> {
    const categoryCheckbox = this.page.getByRole('checkbox', {
      name: new RegExp(`^${escapeRegExp(categoryName)}$`, 'i'),
    });

    await expect(categoryCheckbox).toBeChecked();

    return this;
  }

  async setPriceRange(min: number, max: number): Promise<this> {
    const sliders = this.page.getByRole('slider');

    await expect(sliders).toHaveCount(2);

    const minSlider = sliders.nth(0);
    const maxSlider = sliders.nth(1);

    const currentMin = Number(await minSlider.getAttribute('aria-valuenow'));
    const currentMax = Number(await maxSlider.getAttribute('aria-valuenow'));

    await this.moveSlider(minSlider, currentMin, min);
    await this.moveSlider(maxSlider, currentMax, max);

    return this;
  }

  async search(query: string): Promise<this> {
    const firstProductBeforeSearch = (await this.getProductNames())[0] ?? '';

    await this.searchInput.fill(query);
    await this.searchButton.click();
    if (firstProductBeforeSearch) {
      await expect
        .poll(async () => {
          const currentFirstProduct = (await this.getProductNames())[0] ?? '';

          return currentFirstProduct;
        })
        .not.toBe(firstProductBeforeSearch);
    }

    return this;
  }

  async openFirstProduct(): Promise<ProductPage> {
    await this.productNameItems.first().click();

    return new ProductPage(this.page);
  }

  async sortByPriceLowToHigh(): Promise<this> {
    const firstPriceBeforeSorting = (await this.getNormalizedProductPrices())[0];

    await this.sortDropdown.selectOption({ label: 'Price (Low - High)' });
    if (firstPriceBeforeSorting !== undefined) {
      await expect
        .poll(async () => {
          const currentFirstPrice = (await this.getNormalizedProductPrices())[0];

          return currentFirstPrice;
        })
        .not.toBe(firstPriceBeforeSorting);
    }

    return this;
  }

  async goToPage(pageNumber: number): Promise<this> {
    await this.page
      .getByRole('button', { name: new RegExp(`^${pageNumber}$|^Page-${pageNumber}$`) })
      .click();

    return this;
  }

  async assertCurrentPage(pageNumber: number): Promise<this> {
    await expect(
      this.page.getByRole('button', { name: new RegExp(`^${pageNumber}$|^Page-${pageNumber}$`) }),
    ).toBeVisible();

    return this;
  }

  async getProductNames(): Promise<string[]> {
    const names = await this.productNameItems.allTextContents();

    return names.map((n) => n.trim()).filter(Boolean);
  }

  async getNormalizedProductPrices(): Promise<number[]> {
    const priceTexts = await this.productPriceItems.allTextContents();

    return priceTexts.map((priceText) => normalizePrice(priceText));
  }

  private async moveSlider(slider: Locator, from: number, to: number): Promise<void> {
    if (Number.isNaN(from)) {
      throw new Error('Unable to determine slider current value via aria-valuenow.');
    }

    const direction = to > from ? 'ArrowRight' : 'ArrowLeft';
    const steps = Math.abs(to - from);

    for (let i = 0; i < steps; i++) {
      await slider.press(direction);
    }
  }
}
