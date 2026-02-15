import { test } from '@fixtures/getAuthenticatedUser';
import { HomePage } from '@pages/HomePage';
import { expect } from '@playwright/test';

test.describe('User account tests', () => {
  test('Verify that user profile data is correct', async ({ page, authenticatedUserData }) => {
    const user = authenticatedUserData;

    const homePage = await new HomePage(page).goTo();

    const profilePage = await homePage.header.goToProfilePage();

    await profilePage.assertProfileInfo(user);
  });

  test('Verify favorite products', async ({ page, productApi }) => {
    const homePage = await new HomePage(page).goTo();

    const productPage = await homePage.selectRandomProduct();
    const productInfo = await productPage.getCurrentProductInfoById(productApi);
    await productPage.clickAddToFavorites();
    await expect(productPage.getAddedToFavoritesPopUp()).toBeVisible();

    const favoritesPage = await productPage.header.goToFavoritesPage();

    await favoritesPage.verifyProductInFavorites(productInfo);
  });
});
