import test, { expect } from '@playwright/test';

let token: string;
let newUserId: string;
const email = process.env.EMAIL!;
const password = process.env.PASSWORD_!;

test('API user login', async ({ request, baseURL }) => {
  const response = await request.post(`${baseURL}/api/users/login`, {
    data: {
      email: email,
      password: password,
    },
  });

  const responseObject = await response.json();

  expect(response.status()).toBe(200);

  token = responseObject.access_token;
});

test.skip('Get user from DB', async ({ request, baseURL }) => {
  const response = await request.get(`${baseURL}/api/users/`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const responseObject = await response.json();
  const usersTotal = responseObject.data.length - 1;
  newUserId = responseObject.data[usersTotal].id;
  console.log(responseObject.data[usersTotal].id);

  expect(JSON.stringify(responseObject.data)).toContain('EMAIL');
});

test.skip('Delete user from DB', async ({ request, baseURL }) => {
  const response = await request.delete(`${baseURL}/api/users/${newUserId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  console.log(response.status());
  expect(response.status()).toBe(204);
});
