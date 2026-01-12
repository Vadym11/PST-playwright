import {test } from "../../fixtures/apiFixtures";
import { expect } from '@playwright/test';
import { HomePage } from "../../pages/HomePage";
import { LoginPage } from "../../pages/LoginPage";
import { deleteUserById, generateRandomuserData, getUserIdByEmail } from "../../test-utils/test-utils";
import { User } from "../../types/user";
const connection = require('../../test-utils/mysqldb');

// test.use({ storageState: path.join(__dirname, '.authFile/userLocal.json') });
test.describe.serial('Registration feature', () => {

    let newUserData: User;
    let token: string;

    test.beforeAll('Generate new user data', async ({adminToken}) => {
        token = adminToken;
        newUserData = generateRandomuserData();
    });

    // test.afterAll('Cleanup: delete new user', async () => {
    //     const userId = await getUserIdByEmail(newUserData.email);
    //     console.log(`Deleting user with ID: ${userId}`);
    //     await deleteUserById(userId);
    // });

    test('Register new user: happy path', async ({page}) => {

        await test.step('Register new user', async () => {
            const homePage = await new HomePage(page).goTo();

            await homePage.header.clickSignInLink();

            const registerPage = await new LoginPage(page).clickRegisterLink();

            const loginPage = await registerPage.registerNewUser(newUserData);
            
            await expect(loginPage.getLoginHeader()).toContainText('Login');

            console.log(`User with email ${newUserData.email} and password ${newUserData.password} has registered.`)
        })

        await test.step.skip('Verify created user in DB', async () => {
           
            const [rows] = await connection.execute('SELECT * FROM users ORDER BY updated_at DESC LIMIT 1;');
            const newUser = rows[0];

            expect(newUser.first_name).toBe(newUserData.first_name);
            expect(newUser.last_name).toBe(newUserData.last_name);
            expect(newUser.email).toBe(newUserData.email);
        })
    })

    test('Register new user: user exists', async ({page}) => {
        
        const homePage = await new HomePage(page).goTo();

        await homePage.header.clickSignInLink();

        const registerPage = await new LoginPage(page).clickRegisterLink();

        await registerPage.registerNewUser(newUserData);
        
        await expect(registerPage.getCustomerExistMessage())
            .toContainText('A customer with this email address already exists.');
    })
})