import { test as base } from '@playwright/test';
import { User } from "../types/user";
import { generateRandomuserData, generateRandomuserDataFaker, getAPIBaseUrl } from '../utils/test-utils';

const email = process.env.EMAIL!;
const password = process.env.PASSWORD_!;
const apiBaseURL = getAPIBaseUrl();

type ApiFixtures = {
    adminToken: string;
    getAllUsers: Promise<any>;
    newUserRegistered: User;
    // deleteUser: APIResponse;
}

const test = base.extend<ApiFixtures>({
    
    adminToken: async ({request }, use) => {
        const apiURL = `${apiBaseURL}/users/login`;
        const payload = {
            data: {
                "email": email,
                "password": password
            }
        }
        const response = await request.post(apiURL, payload);

        const token = await response.json().then(data => data.access_token);

        await use(token);
    },

    getAllUsers: async ({request, adminToken}, use) => {
        const apiURL = `${apiBaseURL}/users`;
        const payload = {
            headers: {
                'Authorization': `Bearer ${adminToken}`
            }
        }
        const response = await request.get(apiURL, payload);

        await use(await response.json());
    },

    newUserRegistered: async ({request, adminToken}, use) => {
        const apiURL = `${apiBaseURL}/users/register`;
        const user = generateRandomuserDataFaker();
        const payload = {
            headers: {
                Authorization: `Bearer ${adminToken}`
            },
            data: user
        }
    
        await request.post(apiURL, payload);

        console.log(`User with email ${user.email} has been registered via API.`);

        await use(user);
    },

    // deleteUser: async ({request, baseURL, adminToken, registerNewUser}, use) => {
    //     const getNewUserId = await getUserIdByEmail(registerNewUser.email);

    //     const response = await request.delete(`${baseURL}/api/users/${getNewUserId}`, {
    //         headers: {
    //             Authorization: `Bearer ${adminToken}`
    //         }
    //     });

    //     await use(response);
    // }
});

export { test };