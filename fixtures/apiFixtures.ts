import { APIResponse, test as base } from '@playwright/test';
// import { test as base } from './dbFixtures';
import { User } from "../types/user";
import { generateRandomuserData, getUserIdByEmail } from '../test-utils/test-utils';

const email = process.env.EMAIL!;
const password = process.env.PASSWORD_!;

type ApiFixtures = {
    adminToken: string;
    getAllUsers: APIResponse;
    registerNewUser: User;
    deleteUser: APIResponse;
    user: User;
    userId: string;
}

const test = base.extend<ApiFixtures>({
    
    adminToken: async ({request, baseURL}, use) => {
        const response = await request.post(`${baseURL}/api/users/login`, {
            data: {
                "email": email,
                "password": password
            }
        })

        const token = await response.json().then(data => data.access_token);

        await use(token);
    },

    getAllUsers: async ({request, baseURL, adminToken}, use) => {
        const response = await request.get(`${baseURL}/api/users`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            }
        });

        await use(response);
    },

    registerNewUser: async ({request, baseURL, adminToken}, use) => {
        const user = generateRandomuserData();

        await request.post(`${baseURL}/api/users/register`, {
            headers: {
                Authorization: `Bearer ${adminToken}`
            },
            data: user
        });

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