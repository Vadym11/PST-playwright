import { expect } from '@playwright/test';
import { test } from './fixtures.example';
import { apiBaseURL } from '@utils/test-utils';
import { HomePage } from '@pages/HomePage';

test.afterEach(({}, testInfo) => {
  console.log(`Test duration: ${testInfo.duration} ms`);
});

test.describe.skip(() => {
  test('scrolling test', async ({ page }) => {
    await page.goto('/');

    // Scroll to the bottom of the page
    await page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });

    // Wait for a bit to observe the scroll
    await page.waitForTimeout(2000);
  });

  test('test', async ({ page }) => {
    await page.goto('/');

    const product = page.getByTestId('product-01KMKNWNQ260S5ERCB387YQX3P');
    await product.scrollIntoViewIfNeeded();
  });

  test('scroll test 2', async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => {
      window.scrollTo(0, 500);
    });
  });

  test('@trainingTest Use a fixture', async ({ comment, page, context, browserName }, testInfo) => {
    await page.goto('/');
    console.log(browserName);
    const newTab = await context.newPage();

    await newTab.goto('/');
    await newTab.screenshot({ path: `screenshot-${testInfo.title}.png` });
    await newTab.getByText('Sign in').click();

    await page.bringToFront();

    const c = comment;
    console.log(c);
  });

  test('download and upload', async ({ page }) => {
    await page.addLocatorHandler(
      page.getByText('No thanks, I will continue downloading Macs Fan Control'),
      async () => {
        await page.getByText('No thanks, I will continue downloading Macs Fan Control').click();
      },
    );
    await page.goto('https://macs-fan-control.macupdate.com/');
    await page.getByText('Reject and Close').first().click();

    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.getByText('Download (23.8 MB)').first().click(),
      page.waitForTimeout(2000), // wait for the download to start and the popup to appear
      // page.getByText('No thanks, I will continue downloading Macs Fan Control').click()
    ]);
    await download.saveAs('./downloads/macfancontrol.dmg');
  });

  test('download and upload 1', async ({ page }) => {
    const locator = page.getByText('No thanks, I will continue downloading Macs Fan Control');
    await page.addLocatorHandler(locator, async () => {
      await locator.click();
    });
    await page.goto('https://macs-fan-control.macupdate.com/');
    await page.getByText('Reject and Close').first().click();

    await page.getByText('Download (23.8 MB)').first().click();

    await expect(page.getByText('If your download didn’t start, click the button')).toBeVisible();

    //   const [download] = await Promise.all([
    //     page.waitForEvent('download'),
    //     page.getByText('Download (23.8 MB)').first().click(),
    //     page.waitForTimeout(2000), // wait for the download to start and the popup to appear
    //     // page.getByText('No thanks, I will continue downloading Macs Fan Control').click()
    //   ]);
    // await download.saveAs('./downloads/macfancontrol.dmg');
  });

  // this doesn't work as it works with page storageState
  test('api-storage-state', async ({ request }) => {
    const response = await request.post(`${apiBaseURL}/users/login`, {
      data: { email: 'customer@practicesoftwaretesting.com', password: 'welcome01' },
    });

    expect(response.ok()).toBeTruthy();

    await request.storageState({ path: `playwright/.auth/${test.info().title}-user.json` });
  });

  test('Save storage state', async ({ page }) => {
    const homePage = await new HomePage(page).goTo();
    await homePage.header.clickSignInLink();

    const loginTitle = page.getByRole('heading', { name: 'Login' });

    await expect(async () => {
      await expect(loginTitle).toHaveText('Login');
    }).toPass({
      intervals: [1000, 2000, 3000],
      timeout: 10000,
    });

    // await expect(myAccountPage.myAccountTitle).toHaveText('My account1');

    await page.context().storageState({ path: `playwright/.auth/${test.info().title}-user.json` });

    // await page.frameLocator('iframe').getByRole('button', { name: 'Sign out' }).click();
  });
});
