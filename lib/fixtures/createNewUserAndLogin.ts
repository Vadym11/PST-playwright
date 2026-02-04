import { GetAllUsersResponse } from '@models/api-user';
import { test as baseTest } from '@fixtures/apiFixtures';

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
