import { test, expect } from '@playwright/test';
import productsFixture from '@data-factory/products.json' with { type: 'json' }; // your fixture

test.describe.configure({ retries: 2 });

test.describe('API Interception Tests', () => {
  test('intercept example', async ({ page }) => {
    // 1. Register route mock BEFORE navigation
    await page.route('**/products?*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(productsFixture),
      });
    });

    // 2. Set up the response waiter BEFORE navigation (avoids race condition)
    const productsResponsePromise = page.waitForResponse(
      (response) => response.url().includes('/products') && new URL(response.url()).search !== '', // has query params
    );

    await page.goto('/');

    // 3. Await and assert the intercepted response
    const response = await productsResponsePromise;
    expect(response.status()).toBe(200);
    const body = await response.json();
    // console.log(`Intercepted response body: ${JSON.stringify(body)}`);

    // 4. Assert UI element
    await expect(page.locator('.card').nth(0).getByTestId('product-price')).toHaveText('$99.99');
  });
});
