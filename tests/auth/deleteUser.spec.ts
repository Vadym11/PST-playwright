import { expect } from "@playwright/test";
import { test } from "../../fixtures/apiFixtures";
import { HomePage } from "../../pages/HomePage";
import { LoginPage } from "../../pages/LoginPage";
import { deleteUserById, deleteUserByIdAPI, generateRandomuserData, getUserIdByEmail, getUserIdByEmailAPI } from "../../test-utils/test-utils";
import { User } from "../../types/user";
const connection = require('../../test-utils/mysqldb');

// test.use({ storageState: path.join(__dirname, '.authFile/userLocal.json') });

// MOVE TO API TESTS
test.describe.serial('User deletion feature', () => {

    let token: string;
    let newUserData: User;
    let newUserID: string;

    test.beforeAll('Get token', async ({adminToken}) => {
        token = adminToken;
    });

    test('Register new user', async ({ registerNewUser, request }) => {
        newUserData = registerNewUser;

        newUserID = await getUserIdByEmailAPI(request, token, newUserData.email);
    })

    test('Delete user', async ({request}) => {
        
        await deleteUserByIdAPI(request, token, newUserID);

        console.log(`User with ID: ${newUserID} has been deleted.`);    
    })
})