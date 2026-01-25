import { User } from '../types/user';
import { GetAllUsersResponse } from '../types/api-user';
import { test as baseTest } from './apiFixtures';

type NewUserLoggedInFixture = {
  newUserLoggedIn: GetAllUsersResponse;
};

const test = baseTest.extend<NewUserLoggedInFixture>({
  newUserLoggedIn: async ({ newUserRegistered }, use) => {
    const newUser = newUserRegistered;

    await use(newUser);
  },
});

export { test };
