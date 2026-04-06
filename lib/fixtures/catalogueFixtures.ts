import { test as base } from '@playwright/test';
import { ProductCataloguePage } from '@pages/ProductCataloguePage';

type CatalogueFixtures = {
  cataloguePage: ProductCataloguePage;
};

const test = base.extend<CatalogueFixtures>({
  cataloguePage: async ({ page }, use) => {
    const cataloguePage = await new ProductCataloguePage(page).open();

    await use(cataloguePage);
  },
});

export { test };
