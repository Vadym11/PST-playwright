import { faker } from '@faker-js/faker';
import { test } from '@fixtures/adminStorageState';
import { AdminDashboardPage } from '@pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@pages/admin/AdminProductsPage';
import { generateRandomProductData, mapToProductDetails } from '@utils/test-utils';

test.describe('Admin Panel Tests', () => {
  test(
    'TC-ADMIN-001 - Admin: Dashboard Loads Correctly',
    { tag: ['@admin', '@smoke'] },
    async ({ page }) => {
      const adminDashboardPage = await new AdminDashboardPage(page).open();

      await adminDashboardPage.assertAdminDashboard();
    },
  );

  test(
    'TC-ADMIN-002 - Admin: View All Products',
    { tag: ['@admin', '@products'] },
    async ({ page }) => {
      const adminProductsPage = await new AdminProductsPage(page).open();

      await adminProductsPage.assertAdminProductsPage();
    },
  );

  test(
    'TC-ADMIN-003 - Admin: Create New Product',
    { tag: ['@admin', '@products'] },
    async ({ page, apiHandler }) => {
      const productDetails = mapToProductDetails(await generateRandomProductData(apiHandler));

      const adminProductsPage = await new AdminProductsPage(page).open();

      const productCreationPage = await adminProductsPage.clickAddProductButton();

      await productCreationPage.enterProductDetails(productDetails);

      await productCreationPage.clickSaveButton();

      await productCreationPage.assertProductSavedMessage();
      await productCreationPage.assertProductImage(productDetails);

      await adminProductsPage.open();
      await adminProductsPage.searchProduct(productDetails.name);
      await adminProductsPage.assertSearchedProduct(productDetails);
    },
  );

  test('TC-ADMIN-004 - Admin: Edit Product', async ({ page, apiHandler, productApi }) => {
    const productData = await generateRandomProductData(apiHandler);
    const createdProduct = await productApi.create(productData);

    const adminProductsPage = await new AdminProductsPage(page).open();
    await adminProductsPage.searchProduct(createdProduct.name);
    const adminProductCreationPage = await adminProductsPage.clickEditProduct(createdProduct.name);

    const updatedDetails = {
      ...mapToProductDetails(productData),
      name: faker.commerce.productName(),
      price: parseFloat(faker.commerce.price(10, 200, 2)),
      stock: productData.is_rental === 1 ? null : faker.datatype.number({ min: 1, max: 100 }),
    };

    await adminProductCreationPage.enterProductDetails(updatedDetails, true);

    await adminProductCreationPage.clickSaveButton();

    await adminProductCreationPage.assertProductSavedMessage();

    await adminProductsPage.open();
    await adminProductsPage.searchProduct(updatedDetails.name);
    await adminProductsPage.assertSearchedProduct(updatedDetails);
  });
});
