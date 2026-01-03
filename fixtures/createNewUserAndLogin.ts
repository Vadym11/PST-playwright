import { APIResponse, expect } from '@playwright/test';
import { deleteUserById, generateRandomuserData, getUserIdByEmail } from "../test-utils/test-utils";
import { User } from "../types/user";
import { test as baseTest} from './apiFixtures';

type NewUserLoggedInFixture = {
    newUserLoggedIn: User;
}

 const test = baseTest.extend<NewUserLoggedInFixture>({

    newUserLoggedIn: async ({registerNewUser}, use) => {
        const newUser = registerNewUser;

        await use(newUser);

        const newUserId = await getUserIdByEmail(newUser.email);

        console.log(`User ID to be deleted: ${newUserId}`);

        await deleteUserById(newUserId);
    }
})

export { test };