import { test } from '../../fixtures/apiFixtures';
import { Product } from '../../lib/models/api-product';
import {
  createProductAPI,
  deleteProductByIdAPI,
  getAllProductsAPI,
  getProductByIdAPI,
} from '../../utils/api-utils';
import { generateRandomProductData } from '../../utils/test-utils';

test.describe.serial('Product API Tests', () => {
  let createdProductID: string;
  let newProductData: Product;

  test('Get All Products', async ({ workerApiHandler }) => {
    const products = await getAllProductsAPI(workerApiHandler);

    test.expect(products).toBeDefined();
    test.expect(Array.isArray(products.data)).toBe(true);
  });

  test('Create Product', async ({ workerApiHandler }) => {
    newProductData = await generateRandomProductData(workerApiHandler);

    const createdProduct = await createProductAPI(workerApiHandler, newProductData);

    createdProductID = createdProduct.id;

    test.expect(createdProduct).toBeDefined();
    test.expect(createdProduct.name).toBe(newProductData.name);
    test.expect(createdProduct.description).toBe(newProductData.description);
    test.expect(createdProduct.price).toBe(newProductData.price);
  });

  test('Get Product by ID', async ({ workerApiHandler }) => {
    const product = await getProductByIdAPI(workerApiHandler, createdProductID);

    test.expect(product).toBeDefined();
    test.expect(product.id).toBe(createdProductID);
    test.expect(product.name).toBe(newProductData.name);
    test.expect(product.description).toBe(newProductData.description);
    test.expect(product.price).toBe(newProductData.price);
  });

  test('Delete Product by ID', async ({ workerApiHandler }) => {
    const deleteStatus = await deleteProductByIdAPI(workerApiHandler, createdProductID);

    test.expect(deleteStatus).toBe(204);
  });
});
