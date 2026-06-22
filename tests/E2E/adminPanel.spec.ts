import { test } from '@fixtures/getAuthenticatedUser';
import { AdminDashboardPage } from '@pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@pages/admin/AdminProductsPage';

test.describe('Admin Panel Tests', () => {
  test.use({ storageState: async ({ adminUserStateWorker }, use) => use(adminUserStateWorker) });

  test('TC-AUTH-001 - Admin: Dashboard Loads Correctly', async ({ page }) => {
    const adminDashboardPage = await new AdminDashboardPage(page).open();

    await adminDashboardPage.assertAdminDashboard();
  });

  test('TC-AUTH-002 - Admin: View All Products', async ({ page }) => {
    const adminProductsPage = await new AdminProductsPage(page).open();

    await adminProductsPage.assertAdminProductsPage();
  });
});
