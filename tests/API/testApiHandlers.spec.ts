import { test } from '@fixtures/apiFixtures';
import { GetAllUsersResponse } from '@models/api-user';
import { PaginatedResponse } from '@models/api-responses';
import path from 'path';
import fs from 'fs';
import { getUserByEmailAPI } from '@utils/api-utils';

test('API handlers', async ({ apiHandler }) => {
  const params = { page: 3 };

  const users = await apiHandler.get<PaginatedResponse<GetAllUsersResponse>>('/users', params);
});

test('API handler util', async ({ apiHandler }) => {
  const userPath = path.join(process.cwd(), 'playwright/.auth/userData.json');
  const userData = JSON.parse(fs.readFileSync(userPath, 'utf-8'));
  const user = await getUserByEmailAPI(apiHandler, userData.email);
});
