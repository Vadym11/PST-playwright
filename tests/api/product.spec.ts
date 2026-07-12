import { test } from '@fixtures/apiFixtures';
import { expect } from '@playwright/test';
import type { GetProductResponse, Product, ProductApiState } from '@models/api-product';
import type { PaginatedResponse } from '@models/api-responses';
import { generateRandomProductData } from '@utils/test-utils';

test.describe.serial('Product API Tests', () => {
  const state: ProductApiState = {
    createdProductId: '',
    productData: {} as Product,
    updatedPrice: 199.99,
    patchedDescription: 'Patched description',
  };

  const getProductId = (): string => {
    expect(state.createdProductId, 'Expected product id to be initialized').toBeTruthy();

    return state.createdProductId;
  };

  const assertPaginatedProducts = (products: PaginatedResponse<GetProductResponse>) => {
    expect(products.data).toEqual(expect.any(Array));
    expect(products.current_page).toEqual(expect.any(Number));
    expect(products.per_page).toEqual(expect.any(Number));
    expect(products.total).toEqual(expect.any(Number));
    expect(products.last_page).toEqual(expect.any(Number));
  };

  const assertProductMatchesPayload = (product: GetProductResponse, payload: Product) => {
    expect(product.id).toEqual(expect.any(String));
    expect(product.name).toBe(payload.name);
    expect(product.description).toBe(payload.description);
    expect(product.price).toBe(payload.price);
  };

  test.beforeAll('Setup product once', async ({ apiHandler, productApi }) => {
    state.productData = await generateRandomProductData(apiHandler);
    const createdProduct = await productApi.create(state.productData);

    assertProductMatchesPayload(createdProduct, state.productData);
    state.createdProductId = createdProduct.id;
  });

  test.afterAll('Cleanup product', async ({ productApi, adminToken }) => {
    if (!state.createdProductId) {
      return;
    }

    const deleteStatus = await productApi.deleteById(state.createdProductId, adminToken);
    expect(deleteStatus).toBe(204);
  });

  test('Get All Products', async ({ productApi }) => {
    const products = await productApi.getAll();

    assertPaginatedProducts(products);
  });

  test('Get Product by ID', async ({ productApi }) => {
    const product = await productApi.getById(getProductId());

    assertProductMatchesPayload(product, state.productData);
    expect(product.id).toBe(state.createdProductId);
  });

  test('Get Related Products by ID', async ({ productApi }) => {
    const relatedProducts = await productApi.getRelatedProductsById(getProductId());

    expect(relatedProducts).toEqual(expect.any(Array));
  });

  test('Update Product Price', async ({ productApi }) => {
    const updatedProductPayload: Product = { ...state.productData, price: state.updatedPrice };

    const response = await productApi.update(updatedProductPayload, getProductId());

    expect(response.success).toBe(true);

    const currentProduct = await productApi.getById(getProductId());
    expect(currentProduct.price).toBe(state.updatedPrice);

    state.productData.price = state.updatedPrice;
  });

  test('Patch Product (update description)', async ({ productApi }) => {
    const response = await productApi.patch(
      { description: state.patchedDescription },
      getProductId(),
    );

    expect(response.success).toBe(true);

    const currentProduct = await productApi.getById(getProductId());
    expect(currentProduct.description).toBe(state.patchedDescription);

    state.productData.description = state.patchedDescription;
  });

  test('Search Product by Name', async ({ productApi }) => {
    const searchResults = await productApi.searchByName(state.productData.name);

    assertPaginatedProducts(searchResults);

    const foundProduct = searchResults.data.find(
      (product) => product.id === state.createdProductId,
    );

    expect(foundProduct).toBeDefined();

    if (foundProduct) {
      expect(foundProduct.description).toBe(state.productData.description);
      expect(foundProduct.price).toBe(state.productData.price);
    }
  });
});
