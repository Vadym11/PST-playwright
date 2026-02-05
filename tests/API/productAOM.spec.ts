import { test } from '@fixtures/apiFixtures';
import { expect } from '@playwright/test';
import type { Product } from '@models/api-product';
import { generateRandomProductData } from '@utils/test-utils';

test.describe.serial('Product API Tests', () => {
  let createdProductID: string;
  let newProductData: Product;
  const newPrice = 199.99;

  test('Get All Products', async ({ productApi }) => {
    const products = await productApi.getAll();

    expect(products).toBeDefined();
    expect(Array.isArray(products.data)).toBe(true);
  });

  test('Create Product', async ({ workerApiHandler, productApi }) => {
    newProductData = await generateRandomProductData(workerApiHandler);

    const createdProduct = await productApi.create(newProductData);

    createdProductID = createdProduct.id;

    expect(createdProduct).toBeDefined();
    expect(createdProduct.name).toBe(newProductData.name);
    expect(createdProduct.description).toBe(newProductData.description);
    expect(createdProduct.price).toBe(newProductData.price);
  });

  test('Get Product by ID', async ({ productApi }) => {
    const product = await productApi.getById(createdProductID);

    expect(product).toBeDefined();
    expect(product.id).toBe(createdProductID);
    expect(product.name).toBe(newProductData.name);
    expect(product.description).toBe(newProductData.description);
    expect(product.price).toBe(newProductData.price);
  });

  test('Get Related Products by ID', async ({ productApi }) => {
    const relatedProducts = await productApi.getRelatedProductsById(createdProductID);

    expect(relatedProducts).toBeDefined();
    expect(Array.isArray(relatedProducts)).toBe(true);
  });

  test('Update Product Price', async ({ productApi }) => {
    newProductData.price = newPrice;

    const response = await productApi.update(newProductData, createdProductID);

    expect(response.success).toBe(true);
  });

  test('Patch Product (update description)', async ({ productApi }) => {
    newProductData.description = 'Patched description';

    const response = await productApi.patch(
      { description: newProductData.description },
      createdProductID,
    );

    expect(response.success).toBe(true);
  });

  test('Search Product by Name', async ({ productApi }) => {
    const searchResults = await productApi.searchByName(newProductData.name);

    expect(searchResults).toBeDefined();
    expect(Array.isArray(searchResults.data)).toBe(true);

    const foundProduct = searchResults.data.find((product) => product.id === createdProductID);

    expect(foundProduct).toBeDefined();

    if (foundProduct) {
      expect(foundProduct.description).toBe(newProductData.description);
      expect(foundProduct.price).toBe(newPrice);
    }
  });

  test('Delete Product by ID', async ({ productApi }) => {
    const deleteStatus = await productApi.deleteById(createdProductID);

    expect(deleteStatus).toBe(204);
  });
});
