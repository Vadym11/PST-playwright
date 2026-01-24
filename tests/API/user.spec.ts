import { test } from '../../fixtures/apiFixtures';
import { expect } from '@playwright/test';
import { User } from '../../types/user';
import { generateRandomuserDataFaker } from '../../utils/test-utils';
import {
  deleteUserAPI,
  forgotPasswordAPI,
  getCurrentUserData,
  loginAPI,
  loginUserAPI,
  logOutUserAPI,
  registerUserAPI as registerUserAPI,
} from '../../utils/api-utils';

let newUser: User;
let newUserId: string;
let userToken: string;

test.describe.serial('User API tests', () => {
  test.beforeAll('Generate new user', async () => {
    newUser = generateRandomuserDataFaker();

    console.log(`Generated user email: ${newUser.email}`);
  });

  test('Register user', async ({ workerApiHandler }) => {
    const response = await registerUserAPI(workerApiHandler, newUser);
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

  test('User login', async ({ workerApiHandler }) => {
    const response = await loginUserAPI(workerApiHandler, newUser.email, newUser.password);

    userToken = response.access_token;

    expect(response.access_token).toBeDefined();
    expect(response.token_type).toBe('bearer');
    expect(response.expires_in).toBe(300);
  });

  test('Get current user data', async ({ workerApiHandler }) => {
    const currentUser = await getCurrentUserData(workerApiHandler, userToken);

    expect(currentUser.first_name).toBe(newUser.first_name);
    expect(currentUser.last_name).toBe(newUser.last_name);
    expect(currentUser.email).toBe(newUser.email.toLowerCase());
  });

  test('Logout', async ({ workerApiHandler }) => {
    const response = await logOutUserAPI(workerApiHandler, userToken);

    expect(response.message).toBe('Successfully logged out');
  });

  test('Forgot password', async ({ workerApiHandler }) => {
    const response = await forgotPasswordAPI(workerApiHandler, newUser.email);

    expect(response.success).toBe(true);
  });

  test('User login - new password', async ({ workerApiHandler }) => {
    const response = await loginUserAPI(workerApiHandler, newUser.email, 'welcome02');

    userToken = response.access_token;

    expect(response.access_token).toBeDefined();
    expect(response.token_type).toBe('bearer');
    expect(response.expires_in).toBe(300);
  });

  test('Delete user', async ({ workerApiHandler }) => {
    const response = await deleteUserAPI(workerApiHandler, newUserId);

    expect(response).toBe(204);
  });
});
