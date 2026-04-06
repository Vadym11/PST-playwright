import { expect } from '@playwright/test';
import { test } from '@fixtures/catalogueFixtures';

test.describe('Product Catalogue & Search', () => {
  test(
    'TC-CAT-001 - Product Listing Page Loads',
    { tag: ['@smoke', '@catalogue', '@ui'] },
    async ({ cataloguePage }) => {
      await cataloguePage.assertListingLoaded();
      await expect(cataloguePage.productNameItems.first()).toBeVisible();
    },
  );

  test(
    'TC-CAT-002 - Filter Products by Category',
    { tag: ['@catalogue', '@filter', '@ui'] },
    async ({ cataloguePage }) => {
      await cataloguePage.filterByCategory('Hand Tools');
      await cataloguePage.assertCategoryFilterActive('Hand Tools');

      await expect(cataloguePage.productNameItems.first()).toBeVisible();
    },
  );

  test(
    'TC-CAT-003 - Filter Products by Price Range',
    { tag: ['@catalogue', '@filter', '@ui'] },
    async ({ cataloguePage }) => {
      await test.step('Apply price range filter $10-$50', async () => {
        await cataloguePage.setPriceRange(10, 50);
      });

      const normalizedPrices = await test.step('Get product prices', async () => {
        return cataloguePage.getNormalizedProductPrices();
      });

      await test.step('Verify all prices are within range', async () => {
        expect(normalizedPrices.length).toBeGreaterThan(0);

        for (const price of normalizedPrices) {
          expect(price).toBeGreaterThanOrEqual(10);
          expect(price).toBeLessThanOrEqual(50);
        }
      });
    },
  );

  test(
    'TC-CAT-004 - Search for a Product by Name',
    { tag: ['@smoke', '@catalogue', '@search', '@ui'] },
    async ({ cataloguePage }) => {
      await cataloguePage.search('Hammer');

      const productNames = await cataloguePage.getProductNames();

      expect(productNames.length).toBeGreaterThan(0);
      expect(productNames.some((name) => /hammer/i.test(name))).toBeTruthy();
    },
  );

  test(
    'TC-CAT-005 - Search with No Results',
    { tag: ['@catalogue', '@search', '@negative'] },
    async ({ cataloguePage }) => {
      await cataloguePage.search('xyznonexistentproduct123');

      await expect(cataloguePage.productNameItems).toHaveCount(0);
      await expect(cataloguePage.noResultsMessage).toBeVisible();
    },
  );

  test(
    'TC-CAT-006 - Product Detail Page Loads Correctly',
    { tag: ['@smoke', '@catalogue', '@ui'] },
    async ({ cataloguePage, page }) => {
      const productPage = await cataloguePage.openFirstProduct();

      await productPage.assertDetailsLoaded();
      await expect(page).toHaveURL(/\/product\//);
    },
  );

  test(
    'TC-CAT-007 - Sort Products by Price Low to High',
    { tag: ['@catalogue', '@sort', '@ui'] },
    async ({ cataloguePage }) => {
      await cataloguePage.sortByPriceLowToHigh();

      const normalizedPrices = await cataloguePage.getNormalizedProductPrices();

      expect(normalizedPrices.length).toBeGreaterThan(1);
      expect(normalizedPrices).toEqual([...normalizedPrices].sort((a, b) => a - b));
    },
  );

  test(
    'TC-CAT-008 - Pagination Works Correctly',
    { tag: ['@catalogue', '@pagination', '@ui'] },
    async ({ cataloguePage }) => {
      const firstPageProductNames = await test.step('Capture first page products', async () => {
        const names = await cataloguePage.getProductNames();
        expect(names.length).toBeGreaterThan(0);
        return names;
      });

      await test.step('Navigate to page 2', async () => {
        await cataloguePage.goToPage(2);
        await cataloguePage.assertCurrentPage(2);
      });

      await test.step('Verify page 2 has different products', async () => {
        await expect
          .poll(async () => JSON.stringify(await cataloguePage.getProductNames()))
          .not.toBe(JSON.stringify(firstPageProductNames));

        const secondPageProductNames = await cataloguePage.getProductNames();
        expect(secondPageProductNames.length).toBeGreaterThan(0);
      });
    },
  );
});
