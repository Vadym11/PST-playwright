import { User } from '../types/user';
import { UserAPI } from '../types/usersAPI';
import { test as baseTest } from './apiFixtures';

type NewUserLoggedInFixture = {
  newUserLoggedIn: UserAPI;
};

const test = baseTest.extend<NewUserLoggedInFixture>({
  newUserLoggedIn: async ({ newUserRegistered }, use) => {
    const newUser = newUserRegistered;

    await use(newUser);
  },
});

export { test };
