import { User } from "../types/user";
import { test as baseTest} from './apiFixtures';

type NewUserLoggedInFixture = {
    newUserLoggedIn: User;
}

 const test = baseTest.extend<NewUserLoggedInFixture>({

    newUserLoggedIn: async ({newUserRegistered}, use) => {
        const newUser = newUserRegistered;

        await use(newUser);

        // const newUserId = await getUserIdByEmail(newUser.email);

        // console.log(`User ID to be deleted: ${newUserId}`);

        // await deleteUserById(newUserId);
    }
})

export { test };