import { test } from '../../fixtures/apiFixtures';
import { APIHandler } from '../../utils/apiHandler';
import { getAPIBaseUrl, getUserDataByEmailAPI } from '../../utils/test-utils';
import { UserAPI } from '../../types/usersAPI';
import { Product } from '../../types/productsAPI';
import { PaginatedResponse } from '../../types/api-responses';

test('API handlers', async ({ apiHandler }) => {
  const baseAPIUrl = getAPIBaseUrl();
  const fullAPIUrl = `${baseAPIUrl}/users`;

  // const apiHandler = new APIHandler(request);

  const params = { page: 3 };

  const users = await apiHandler.get<PaginatedResponse<UserAPI>>(fullAPIUrl, params);

  console.log(users.current_page);
  console.log(users.data[0]);
});

test('API handler util', async ({ apiHandler }) => {
  const user = await getUserDataByEmailAPI(apiHandler, 'rosalia.conn@gmail.com');

  console.log(user.id);
  console.log(user.first_name + ' ' + user.last_name);
});
