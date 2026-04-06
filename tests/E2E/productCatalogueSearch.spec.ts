import { expect, test } from '@playwright/test';
import { ProductCataloguePage } from '@pages/ProductCataloguePage';

test.describe('Product Catalogue & Search', () => {
  test(
    'TC-CAT-001 - Product Listing Page Loads',
    { tag: ['@smoke', '@catalogue', '@ui'] },
    async ({ page }) => {
      const cataloguePage = await new ProductCataloguePage(page).open();

      await cataloguePage.assertListingLoaded();
      await expect(cataloguePage.productNameItems.first()).toBeVisible();
    },
  );

  test(
    'TC-CAT-002 - Filter Products by Category',
    { tag: ['@catalogue', '@filter', '@ui'] },
    async ({ page }) => {
      const cataloguePage = await new ProductCataloguePage(page).open();

      await cataloguePage.filterByCategory('Hand Tools');
      await cataloguePage.assertCategoryFilterActive('Hand Tools');
      await expect(cataloguePage.productNameItems.first()).toBeVisible();
    },
  );

  test(
    'TC-CAT-003 - Filter Products by Price Range',
    { tag: ['@catalogue', '@filter', '@ui'] },
    async ({ page }) => {
      const cataloguePage = await new ProductCataloguePage(page).open();

      await cataloguePage.setPriceRange(10, 50);

      const normalizedPrices = await cataloguePage.getNormalizedProductPrices();
      expect(normalizedPrices.length).toBeGreaterThan(0);

      for (const price of normalizedPrices) {
        expect(price).toBeGreaterThanOrEqual(10);
        expect(price).toBeLessThanOrEqual(50);
      }
    },
  );

  test(
    'TC-CAT-004 - Search for a Product by Name',
    { tag: ['@smoke', '@catalogue', '@search', '@ui'] },
    async ({ page }) => {
      const cataloguePage = await new ProductCataloguePage(page).open();

      await cataloguePage.search('Hammer');

      const productNames = await cataloguePage.getProductNames();
      expect(productNames.length).toBeGreaterThan(0);
      expect(productNames.some((name) => /hammer/i.test(name))).toBeTruthy();
    },
  );

  test(
    'TC-CAT-005 - Search with No Results',
    { tag: ['@catalogue', '@search', '@negative'] },
    async ({ page }) => {
      const cataloguePage = await new ProductCataloguePage(page).open();

      await cataloguePage.search('xyznonexistentproduct123');

      await expect(cataloguePage.productNameItems).toHaveCount(0);
      await expect(cataloguePage.noResultsMessage).toBeVisible();
    },
  );

  test(
    'TC-CAT-006 - Product Detail Page Loads Correctly',
    { tag: ['@smoke', '@catalogue', '@ui'] },
    async ({ page }) => {
      const cataloguePage = await new ProductCataloguePage(page).open();
      const productPage = await cataloguePage.openFirstProduct();

      await productPage.assertDetailsLoaded();
      await expect(page).toHaveURL(/\/product\//);
    },
  );

  test(
    'TC-CAT-007 - Sort Products by Price Low to High',
    { tag: ['@catalogue', '@sort', '@ui'] },
    async ({ page }) => {
      const cataloguePage = await new ProductCataloguePage(page).open();

      await cataloguePage.sortByPriceLowToHigh();

      const normalizedPrices = await cataloguePage.getNormalizedProductPrices();
      expect(normalizedPrices.length).toBeGreaterThan(1);
      expect(normalizedPrices).toEqual([...normalizedPrices].sort((a, b) => a - b));
    },
  );

  test(
    'TC-CAT-008 - Pagination Works Correctly',
    { tag: ['@catalogue', '@pagination', '@ui'] },
    async ({ page }) => {
      const cataloguePage = await new ProductCataloguePage(page).open();

      const firstPageProductNames = await cataloguePage.getProductNames();
      expect(firstPageProductNames.length).toBeGreaterThan(0);

      await cataloguePage.goToPage(2);
      await expect(page.getByRole('button', { name: /^2$|^Page-2$/ })).toBeVisible();

      await expect
        .poll(async () => JSON.stringify(await cataloguePage.getProductNames()))
        .not.toBe(JSON.stringify(firstPageProductNames));

      const secondPageProductNames = await cataloguePage.getProductNames();
      expect(secondPageProductNames.length).toBeGreaterThan(0);
    },
  );
});
