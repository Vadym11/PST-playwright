import { test } from '../../fixtures/apiFixtures';
import { getAPIBaseUrl, getUserDataByEmailAPI } from '../../utils/test-utils';
import { UserAPI } from '../../types/usersAPI';
import { PaginatedResponse } from '../../types/api-responses';
import path from 'path';
import fs from 'fs';

test('API handlers', async ({ apiHandler }) => {
  const baseAPIUrl = getAPIBaseUrl();
  const fullAPIUrl = `${baseAPIUrl}/users`;

  const params = { page: 3 };

  const users = await apiHandler.get<PaginatedResponse<UserAPI>>(fullAPIUrl, params);

  console.log(users.current_page);
  console.log(users.data[0]);
});

test('API handler util', async ({ apiHandler }) => {
  const userPath = path.join(process.cwd(), 'playwright/.auth/userData.json');
  const userData = JSON.parse(fs.readFileSync(userPath, 'utf-8'));
  const user = await getUserDataByEmailAPI(apiHandler, userData.email);
});
