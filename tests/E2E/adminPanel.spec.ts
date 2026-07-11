import { faker } from '@faker-js/faker';
import { test } from '@fixtures/adminStorageState';
import { AdminDashboardPage } from '@pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@pages/admin/AdminProductsPage';
import {
  generateRandomProductDetails,
  generateRandomProductData,
  mapToProductDetails,
} from '@utils/test-utils';

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
      const productDetails = await generateRandomProductDetails(apiHandler);

      const adminProductsPage = await new AdminProductsPage(page).open();

      const productCreationPage = await adminProductsPage.clickAddProductButton();

      await productCreationPage.enterProductDetails(productDetails);

      await productCreationPage.clickSaveButton();

      await productCreationPage.assertProductSavedMessage();
      await productCreationPage.assertProductImage(productDetails);

      await adminProductsPage.open();
      await adminProductsPage.searchProduct(productDetails.name);
      await adminProductsPage.assertSearchedProductRow(productDetails);
    },
  );

  test(
    'TC-ADMIN-004 - Admin: Edit Product',
    { tag: ['@admin', '@products'] },
    async ({ page, apiHandler, productApi }) => {
      const productData = await generateRandomProductData(apiHandler);
      await productApi.create(productData);

      const adminProductsPage = await new AdminProductsPage(page).open();
      await adminProductsPage.searchProduct(productData.name);
      const adminProductCreationPage = await adminProductsPage.clickEditProduct(productData.name);

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
      await adminProductsPage.assertSearchedProductRow(updatedDetails);

      const updatedProductEditPage = await adminProductsPage.clickEditProduct(updatedDetails.name);
      await updatedProductEditPage.assertSearchedProductDetails(updatedDetails);
    },
  );

  test(
    'TC-ADMIN-005 - Admin: Delete Product',
    { tag: ['@admin', '@products'] },
    async ({ page, apiHandler, productApi }) => {
      const productData = await generateRandomProductData(apiHandler);
      await productApi.create(productData);

      const adminProductsPage = await new AdminProductsPage(page).open();
      await adminProductsPage.searchProduct(productData.name);
      await adminProductsPage.clickDeleteProduct(productData.name);
      await adminProductsPage.assertProductDeletedMessage();

      await adminProductsPage.searchProduct(productData.name);
      await adminProductsPage.assertNoProductsFound(mapToProductDetails(productData));
    },
  );

  test(
    'TC-ADMIN-011a - Admin: Empty Form Shows Required Field Messages',
    { tag: ['@admin', '@products'] },
    async ({ page }) => {
      const adminProductsPage = await new AdminProductsPage(page).open();
      const productCreationPage = await adminProductsPage.clickAddProductButton();

      await productCreationPage.clickSaveButton();

      await productCreationPage.assertRequiredFieldMessages();
    },
  );

  test(
    'TC-ADMIN-011b - Admin: Missing Name Shows Required Message',
    { tag: ['@admin', '@products'] },
    async ({ page, apiHandler }) => {
      const productDetails = await generateRandomProductDetails(apiHandler);
      productDetails.name = '';

      const adminProductsPage = await new AdminProductsPage(page).open();
      const productCreationPage = await adminProductsPage.clickAddProductButton();

      await productCreationPage.enterProductDetails(productDetails);
      await productCreationPage.clickSaveButton();

      await productCreationPage.assertProductNameRequiredMessage();
    },
  );

  test(
    'TC-ADMIN-011c - Admin: Missing Description Shows Required Message',
    { tag: ['@admin', '@products'] },
    async ({ page, apiHandler }) => {
      const productDetails = await generateRandomProductDetails(apiHandler);
      productDetails.description = '';

      const adminProductsPage = await new AdminProductsPage(page).open();
      const productCreationPage = await adminProductsPage.clickAddProductButton();

      await productCreationPage.enterProductDetails(productDetails);
      await productCreationPage.clickSaveButton();

      await productCreationPage.assertProductDescriptionRequiredMessage();
    },
  );

  test(
    'TC-ADMIN-011d - Admin: Missing Price Shows Required Field Message',
    { tag: ['@admin', '@products'] },
    async ({ page, apiHandler }) => {
      const productDetails = await generateRandomProductDetails(apiHandler);

      const adminProductsPage = await new AdminProductsPage(page).open();
      const productCreationPage = await adminProductsPage.clickAddProductButton();

      await productCreationPage.enterProductDetails(productDetails);
      await productCreationPage.clearPriceRow();
      await productCreationPage.clickSaveButton();

      await productCreationPage.assertProductPriceRequiredMessage();
    },
  );
});
