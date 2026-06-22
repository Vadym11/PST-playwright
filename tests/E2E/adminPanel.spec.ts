import { test } from '@fixtures/adminStorageState';
import { AdminDashboardPage } from '@pages/admin/AdminDashboardPage';
import { AdminProductsPage } from '@pages/admin/AdminProductsPage';

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
});
