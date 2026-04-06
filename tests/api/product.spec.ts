import { test } from '@fixtures/apiFixtures';
import { Product } from '@models/api-product';
import {
  createProductAPI,
  deleteProductByIdAPI,
  getAllProductsAPI,
  getProductByIdAPI,
} from '@utils/api-utils';
import { generateRandomProductData } from '@utils/test-utils';

test.describe.serial('Product API Tests', () => {
  let createdProductID: string;
  let newProductData: Product;

  test('Get All Products', async ({ apiHandler }) => {
    const products = await getAllProductsAPI(apiHandler);

    test.expect(products).toBeDefined();
    test.expect(Array.isArray(products.data)).toBe(true);
  });

  test('Create Product', async ({ apiHandler }) => {
    newProductData = await generateRandomProductData(apiHandler);

    const createdProduct = await createProductAPI(apiHandler, newProductData);

    createdProductID = createdProduct.id;

    test.expect(createdProduct).toBeDefined();
    test.expect(createdProduct.name).toBe(newProductData.name);
    test.expect(createdProduct.description).toBe(newProductData.description);
    test.expect(createdProduct.price).toBe(newProductData.price);
  });

  test('Get Product by ID', async ({ apiHandler }) => {
    const product = await getProductByIdAPI(apiHandler, createdProductID);

    test.expect(product).toBeDefined();
    test.expect(product.id).toBe(createdProductID);
    test.expect(product.name).toBe(newProductData.name);
    test.expect(product.description).toBe(newProductData.description);
    test.expect(product.price).toBe(newProductData.price);
  });

  test('Delete Product by ID', async ({ apiHandler, adminToken }) => {
    const deleteStatus = await deleteProductByIdAPI(apiHandler, createdProductID, adminToken);

    test.expect(deleteStatus).toBe(204);
  });
});
