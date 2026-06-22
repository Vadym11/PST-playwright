import { test } from '@fixtures/getAuthenticatedUser';
import { AdminDashboardPage } from '@pages/admin/AdminDashboardPage';

test.describe('Admin Panel Tests', () => {
  test.use({ storageState: async ({ adminUserStateWorker }, use) => use(adminUserStateWorker) });

  test('TC-AUTH-001 - Admin Dashboard Loads Correctly', async ({ page }) => {
    const adminDashboardPage = await new AdminDashboardPage(page).open();

    await adminDashboardPage.assertAdminDashboard();
  });
});
