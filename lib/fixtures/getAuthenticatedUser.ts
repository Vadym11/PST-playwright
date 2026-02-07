import { CreateUser } from '@models/api-user';
import { test as baseTest } from '@fixtures/apiFixtures';
import fs from 'fs';
import { userDataFilePath } from '@utils/test-utils';

type NewUserLoggedInFixture = {
  authenticatedUserData: CreateUser;
};

const test = baseTest.extend<NewUserLoggedInFixture>({
  authenticatedUserData: async ({}, use) => {
    // Read the file created by your setup project
    const userData = JSON.parse(fs.readFileSync(userDataFilePath, 'utf-8'));
    await use(userData);
  },
});

export { test };
