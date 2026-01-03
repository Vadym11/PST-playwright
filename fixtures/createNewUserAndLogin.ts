import { APIResponse, test as baseTest, expect, PlaywrightTestArgs, PlaywrightTestOptions } from '@playwright/test';
import { generateRandomuserData } from "../test-utils/test-utils";
import { User } from "../types/user";
import { HomePage } from '../pages/HomePage';
const connection = require('../test-utils/mysqldb');

type NewUserLoggedInFixture = {
    adminLogin: APIResponse;
    newUserLoggedIn: User;
}

const test = baseTest.extend<NewUserLoggedInFixture>({

    adminLogin: async ({request, baseURL}, use) => {
        
        const response = await request.post(`${baseURL}/api/users/login`, {
            data: {
                "email": "admin@practicesoftwaretesting.com",
                "password": "welcome01"
            }
        })

        use(response);
    },

    newUserLoggedIn: async ({request, baseURL, page, adminLogin}, use) => {
        const newUser = generateRandomuserData();

        console.log(newUser.email);
        console.log(newUser.password);
        
        // const loginResponse = await request.post(`${baseURL}/api/users/login`, {
        //     data: {
        //         "email": "admin@practicesoftwaretesting.com",
        //         "password": "welcome01"
        //     }
        // })

        const loginResponse = adminLogin;

        const responseObject_ = await loginResponse.json();

        console.log(loginResponse.status());

        expect(loginResponse.status()).toBe(200);

        const token = responseObject_.access_token;

        console.log(token.substring(0, 20));

        let response = await request.post(`${baseURL}/api/users/register`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: newUser
        })

        let responseObject = await response.json();

        console.log(response.status());

        expect(response.status()).toBe(201);

        const [rows] = await connection.execute('SELECT * FROM users ORDER BY updated_at DESC LIMIT 1;');
        const newUser_ = rows[0];

        console.log('New user from DB:', newUser_.id);

        expect(newUser_.first_name).toBe(newUser.first_name);
        expect(newUser_.last_name).toBe(newUser.last_name);
        expect(newUser_.email).toBe(newUser.email);

    //     response = await request.get(`${baseURL}/api/users/`, {
    //         headers: {
    //             Authorization: `Bearer ${token}`
    //         }
    //     })

    //     responseObject = await response.json();

    //     //    console.log(responseObject);
    //    let usersTotal = responseObject.data.length - 1;
    //    let newUserId = responseObject.data[usersTotal].id;
    //    const lastPage = responseObject.last_page;
       
    //    if (lastPage !== 1) {
    //         console.log(`Last page: ${lastPage}`);
    //         response = await request.get(`${baseURL}/api/users/?page=${lastPage}`, {
    //             headers: {
    //                 Authorization: `Bearer ${token}`
    //             }
    //         })

    //         responseObject = await response.json();

    //         usersTotal = responseObject.data.length - 1;
    //         newUserId = responseObject.data[usersTotal].id;
    //     }

    //     console.log(responseObject.data[usersTotal].id);

    //     expect(JSON.stringify(responseObject.data)).toContain(newUser.email);

        await use(newUser);

        console.log(`User ID to be deleted: ${newUser_.id}`);

        // Cleanup: delete created user

        // await new HomePage(page).header.signOut();

        const [result1] = await connection.execute('DELETE FROM invoice_items WHERE invoice_id = (SELECT id FROM invoices WHERE user_id = ?);', [newUser_.id]);
        console.log(`Cleanup: deleted ${result1.affectedRows} invoice items`);

        const [result2] = await connection.execute('DELETE FROM payments WHERE invoice_id = (SELECT id FROM invoices WHERE user_id = ?);', [newUser_.id]);
        console.log(`Cleanup: deleted ${result2.affectedRows} payments`);

        const [result3] = await connection.execute('DELETE FROM invoices WHERE user_id = ?;', [newUser_.id]);
        console.log(`Cleanup: deleted ${result3.affectedRows} invoices`);

        console.log(`Token: ${token.substring(0, 20)}`);
        response = await request.delete(`${baseURL}/api/users/${newUser_.id}`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        // const [result] = await connection.execute('DELETE FROM users WHERE id = ?;', [newUserId]);
        // console.log(`Cleanup: deleted ${result.affectedRows} users`);

        console.log(response.status());
        expect(response.status()).toBe(204);
    }
})

export { test };