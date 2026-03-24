import { test } from '@fixtures/apiFixtures';
import { expect } from '@playwright/test';
import { CreateUser, GetAllUsersResponse, UserApiState } from '@models/api-user';
import { LoginResponse, PaginatedResponse } from '@models/api-responses';
import { generateRandomuserDataFaker } from '@utils/test-utils';
import { faker } from '@faker-js/faker';

test.describe.serial('User API tests', () => {
  const firstNameForUpdate = faker.name.firstName().replaceAll("'", '');
  const lastNameForUpdate = faker.name.lastName().replaceAll("'", '');

  const state: UserApiState = {
    originalUserData: generateRandomuserDataFaker(),
    currentUserData: {} as CreateUser,
    userId: '',
    userToken: '',
    changedPassword: `Ab1&${Date.now()}${faker.random.alphaNumeric(6)}`,
    resetPassword: process.env.PASSWORD_RESET || 'welcome02',
    newFirstName: firstNameForUpdate,
    newLastName: lastNameForUpdate,
    newEmail: `${firstNameForUpdate}.${lastNameForUpdate}.${Date.now()}@gmail.com`.toLowerCase(),
  };

  const assertPaginatedUsers = (response: PaginatedResponse<GetAllUsersResponse>) => {
    expect(response.data).toEqual(expect.any(Array));
    expect(response.current_page).toEqual(expect.any(Number));
    expect(response.per_page).toEqual(expect.any(Number));
    expect(response.total).toEqual(expect.any(Number));
    expect(response.last_page).toEqual(expect.any(Number));
    expect(response.from).toEqual(expect.any(Number));
    expect(response.to).toEqual(expect.any(Number));
  };

  const assertLoginResponse = (response: LoginResponse) => {
    expect(response.access_token).toEqual(expect.any(String));
    expect(response.token_type).toBe('bearer');
    expect(response.expires_in).toEqual(expect.any(Number));
  };

  const getToken = (): string => {
    expect(state.userToken, 'Expected user token to be initialized').toBeTruthy();

    return state.userToken;
  };

  const getUserId = (): string => {
    expect(state.userId, 'Expected user id to be initialized').toBeTruthy();

    return state.userId;
  };

  test.beforeAll('Setup user once', async ({ adminUserApi, testUserApi }) => {
    state.currentUserData = { ...state.originalUserData };

    const registerResponse = await adminUserApi.register(state.originalUserData);
    expect(registerResponse.id).toEqual(expect.any(String));
    state.userId = registerResponse.id;

    const loginResponse = await testUserApi.login(
      state.currentUserData.email,
      state.currentUserData.password,
    );
    assertLoginResponse(loginResponse);
    state.userToken = loginResponse.access_token;
  });

  test.beforeEach('should login with current credentials', async ({ testUserApi }) => {
    const loginResponse = await testUserApi.login(
      state.currentUserData.email,
      state.currentUserData.password,
    );

    assertLoginResponse(loginResponse);
    state.userToken = loginResponse.access_token;
  });

  test.afterAll('Cleanup registered user', async ({ adminUserApi }) => {
    if (!state.userId) {
      return;
    }

    const response = await adminUserApi.deleteUser(state.userId);
    expect(response).toBe(204);
  });

  test('should get all users', async ({ adminUserApi }) => {
    const response = await adminUserApi.getAll();

    assertPaginatedUsers(response);
  });

  test('should get current user data', async ({ testUserApi }) => {
    const currentUser = await testUserApi.getCurrentUserData(getToken());

    expect(currentUser.first_name).toBe(state.currentUserData.first_name);
    expect(currentUser.last_name).toBe(state.currentUserData.last_name);
    expect(currentUser.email).toBe(state.currentUserData.email.toLowerCase());
  });

  test('should change password and login', async ({ testUserApi }) => {
    const changePasswordResponse = await testUserApi.changePassword(
      getToken(),
      state.currentUserData.password,
      state.changedPassword,
    );

    expect(changePasswordResponse.success).toBe(true);

    const loginResponse = await testUserApi.login(
      state.currentUserData.email,
      state.changedPassword,
    );
    assertLoginResponse(loginResponse);

    state.userToken = loginResponse.access_token;
    state.currentUserData.password = state.changedPassword;
  });

  test('should reset password and login', async ({ testUserApi }) => {
    const forgotPasswordResponse = await testUserApi.forgotPassword(state.currentUserData.email);
    expect(forgotPasswordResponse.success).toBe(true);

    const loginResponse = await testUserApi.login(state.currentUserData.email, state.resetPassword);
    assertLoginResponse(loginResponse);

    state.userToken = loginResponse.access_token;
    state.currentUserData.password = state.resetPassword;
  });

  test('should refresh token', async ({ testUserApi }) => {
    const response = await testUserApi.refreshToken(getToken());

    assertLoginResponse(response);
    state.userToken = response.access_token;
  });

  test('should update user data', async ({ testUserApi }) => {
    const updatedUserPayload: CreateUser = {
      ...state.currentUserData,
      first_name: state.newFirstName,
      last_name: state.newLastName,
    };

    const updateResponse = await testUserApi.update(updatedUserPayload, getToken(), getUserId());
    expect(updateResponse.success).toBe(true);

    const currentUser = await testUserApi.getCurrentUserData(getToken());
    expect(currentUser.first_name).toBe(state.newFirstName);
    expect(currentUser.last_name).toBe(state.newLastName);
    expect(currentUser.email).toBe(state.currentUserData.email.toLowerCase());

    state.currentUserData.first_name = state.newFirstName;
    state.currentUserData.last_name = state.newLastName;
  });

  test('should patch user data (email)', async ({ testUserApi }) => {
    const patchResponse = await testUserApi.patch(
      { email: state.newEmail },
      getToken(),
      getUserId(),
    );
    expect(patchResponse.success).toBe(true);

    const currentUser = await testUserApi.getCurrentUserData(getToken());
    expect(currentUser.email).toBe(state.newEmail);
    expect(currentUser.first_name).toBe(state.currentUserData.first_name);
    expect(currentUser.last_name).toBe(state.currentUserData.last_name);

    state.currentUserData.email = state.newEmail;
  });

  test('should logout', async ({ testUserApi }) => {
    const response = await testUserApi.logOut(getToken());

    expect(response.message).toBe('Successfully logged out');
  });
});
