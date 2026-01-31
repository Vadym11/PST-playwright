import { test } from '../../fixtures/apiFixtures';
import { expect } from '@playwright/test';
import { User } from '../../types/user';
import { generateRandomuserDataFaker } from '../../utils/test-utils';
import { faker } from '@faker-js/faker';

test.describe.serial('User API tests', () => {
  let newUser: User;
  let newUserId: string;
  let userToken: string;
  const newUserFirstName = faker.name.firstName();
  const newUserLastName = faker.name.lastName();
  const newPassword = `${faker.internet.password(8)}$123`;

  test.beforeAll('Generate new user', async () => {
    newUser = generateRandomuserDataFaker();

    console.log(`Generated user email: ${newUser.email}`);
  });

  test('Get all users', async ({ userApi }) => {
    const response = await userApi.getAll();

    expect(response).toBeDefined();
    expect(Array.isArray(response.data)).toBe(true);
    expect(response.current_page).toBeDefined();
    expect(response.per_page).toBeDefined();
    expect(response.total).toBeDefined();
    expect(response.last_page).toBeDefined();
    expect(response.from).toBeDefined();
    expect(response.to).toBeDefined();
  });

  test('Register user', async ({ userApi }) => {
    const response = await userApi.register(newUser);
    newUserId = response.id;

    expect(response.first_name).toBe(newUser.first_name);
    expect(response.last_name).toBe(newUser.last_name);
    expect(response.email).toBe(newUser.email.toLowerCase());
    expect(response.id).toBeDefined();
    expect(response.created_at).toBeDefined();
    expect(response.address).toStrictEqual(newUser.address);
    expect(response.dob).toBe(newUser.dob);
    expect(response.phone).toBe(newUser.phone);
  });

  test('User login', async ({ userApi }) => {
    const response = await userApi.login(newUser.email, newUser.password);

    userToken = response.access_token;

    expect(response.access_token).toBeDefined();
    expect(response.token_type).toBe('bearer');
    expect(response.expires_in).toBe(300);
  });

  test('Change password', async ({ userApi }) => {
    const response = await userApi.changePassword(userToken, newUser.password, newPassword);

    expect(response.success).toBe(true);
  });

  test('Update user data', async ({ userApi }) => {
    newUser.first_name = newUserFirstName;
    newUser.last_name = newUserLastName;

    const response = await userApi.update(newUser, userToken, newUserId);

    expect(response.success).toBe(true);
  });

  test('Get current user data', async ({ userApi }) => {
    const currentUser = await userApi.getCurrentUserData(userToken);

    expect(currentUser.first_name).toBe(newUserFirstName);
    expect(currentUser.last_name).toBe(newUserLastName);
    expect(currentUser.email).toBe(newUser.email.toLowerCase());
  });

  test('Patch user data', async ({ userApi }) => {
    const patchedLastName = `${newUserLastName}-Patched`;

    const response = await userApi.patch({ last_name: patchedLastName }, userToken, newUserId);

    expect(response.success).toBe(true);

    const currentUser = await userApi.getCurrentUserData(userToken);

    expect(currentUser.last_name).toBe(patchedLastName);
  });

  test('Logout', async ({ userApi }) => {
    const response = await userApi.logOut(userToken);

    expect(response.message).toBe('Successfully logged out');
  });

  test('Forgot password', async ({ userApi }) => {
    const response = await userApi.forgotPassword(newUser.email);

    expect(response.success).toBe(true);
  });

  test('User login - new password', async ({ userApi }) => {
    const response = await userApi.login(newUser.email, 'welcome02');

    userToken = response.access_token;

    expect(response.access_token).toBeDefined();
    expect(response.token_type).toBe('bearer');
    expect(response.expires_in).toBe(300);
  });

  test('Refresh token', async ({ userApi }) => {
    const response = await userApi.refreshToken(userToken);

    expect(response.access_token).toBeDefined();
    expect(response.token_type).toBe('bearer');
    expect(response.expires_in).toBe(300);

    userToken = response.access_token;
  });

  test('Delete user', async ({ userApi }) => {
    const response = await userApi.deleteUser(newUserId);

    expect(response).toBe(204);
  });
});
