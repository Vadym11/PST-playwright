import { User } from "../types/user";
import axios from 'axios';
const userData = require("../test-data/registerUserData.json");
const connection = require("./mysqldb");
import config from '../playwright.config';
import { APIRequestContext, expect } from "@playwright/test";

export const getAPIBaseUrl = () => {

    const baseURL = config.use?.baseURL;
    if (!baseURL?.includes('practicesoftwaretesting.com')) {
        return baseURL + '/api';
    } else {
        return baseURL?.split('//')[0] + '//' + 'api.' + baseURL?.split('//')[1];
    }
}

const apiBaseURL = getAPIBaseUrl();

/**
 * Generates a random integer between min (inclusive) and max (inclusive).
 * @param min The minimum possible value.
 * @param max The maximum possible value.
 * @returns A random integer.
 */
export function getRandomIntInclusive(min: number, max: number): number {
    // Ensure inputs are treated as integers for correct range calculation
    const minCeiled: number = Math.ceil(min);
    const maxFloored: number = Math.floor(max);
    
    // The maximum is inclusive and the minimum is inclusive
    // Math.random() generates a number from [0, 1). Multiplying ensures it covers the whole range.
    return Math.floor(Math.random() * (maxFloored - minCeiled + 1) + minCeiled);
}

export function getRandomArrayElement(array: any[]) {
    return array[getRandomIntInclusive(0, array.length - 1)]
}

export function generateRandomuserData(): User {
    const randomNumber = getRandomIntInclusive(0, 9999);

    const FIRST_NAME = getRandomArrayElement(userData.firstNames);
    const LAST_NAME = getRandomArrayElement(userData.lastNames);
    const DOB = getRandomArrayElement(userData.dob);
    const STREET = getRandomArrayElement(userData.streets);
    const POSTCODE = getRandomArrayElement(userData.postcodes);
    const CITY = getRandomArrayElement(userData.cities);
    const STATE = getRandomArrayElement(userData.states);
    const COUNTRY = getRandomArrayElement(userData.countries);
    const PHONE = getRandomArrayElement(userData.phones);
    const EMAIL = `${FIRST_NAME}.${LAST_NAME}${randomNumber}@gmail.com`;
    const PASSWORD = `${FIRST_NAME}.${LAST_NAME}**12345$%`;

    return {
        first_name: FIRST_NAME,
        last_name: LAST_NAME,
        address: {
            street: STREET,
            postal_code: POSTCODE,
            city: CITY,
            state: STATE,
            country: COUNTRY,
        },
        dob: DOB,
        phone: PHONE,
        email: EMAIL.toLowerCase(),
        password: PASSWORD
    }
}

export async function getUserIdByEmail(email: string): Promise<string> {
    for (let i = 0; i < 5; i++) {
        const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?;', [email]);
        if (rows && rows.length > 0) return rows[0].id;
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
    }
    
    throw new Error(`User with email ${email} was not found in DB after registration.`);
}

export async function getUserDataByEmailAxios(token: string, email: string): Promise<any> {
    const apiURL = `${apiBaseURL}/users/search`;

    const config = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        params: {
            q: email
        }
    }

    const response = await axios.get(apiURL, config);

    if (response.data.data.length === 0) {
        throw new Error(`User with email ${email} was not found in API response.`);
    } else {
        return response.data.data[0];
    }
}

export async function getUserDataByEmailAPI(request: APIRequestContext, token: string, email: string): Promise<any> {
    const apiURL = `${apiBaseURL}/users/search`;
    const payload = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        params: {
            q: email
        }
    }

    const response = await request.get(apiURL, payload);

    expect(response.status()).toBe(200);

    const body = await response.json();

    if (body.data.length === 0) {
        throw new Error(`User with email ${email} was not found in API response.`);
    }

    return body.data[0];
}

export async function getUserIdByEmailAPI(request: APIRequestContext, token: string, email: string): Promise<string> {
    const user = await getUserDataByEmailAPI(request, token, email);

    return user.id;
}

export async function deleteUserByIdAPI(request: APIRequestContext, token: string, userID: string): Promise<void> {
    const apiURL = `${apiBaseURL}/users/${userID}`;

    const payload = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }

    const response = await request.delete(apiURL, payload);

    expect(response.status()).toBe(204);
}

export async function deleteUserById(userId: string): Promise<void> {

    const [result1] = await connection.execute('DELETE FROM invoice_items WHERE invoice_id = (SELECT id FROM invoices WHERE user_id = ?);', [userId]);
    console.log(`Cleanup: deleted ${result1.affectedRows} invoice items`);
    const [result2] = await connection.execute('DELETE FROM payments WHERE invoice_id = (SELECT id FROM invoices WHERE user_id = ?);', [userId]);
    console.log(`Cleanup: deleted ${result2.affectedRows} payments`);
    const [result3] = await connection.execute('DELETE FROM invoices WHERE user_id = ?;', [userId]);
    console.log(`Cleanup: deleted ${result3.affectedRows} invoices`);
    const [result4] = await connection.execute('DELETE FROM users WHERE id = ?;', [userId]);
    console.log(`Cleanup: deleted ${result4.affectedRows} users`);  
    
}

export async function generateAndRegisterUsers(count: number, adminToken: string): Promise<void> {
    const apiURL = `${apiBaseURL}/api/users/register`;
   
    const config = {
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    };

    for (let i = 0; i < count; i++) {
        try {
            const newUser = generateRandomuserData();
            const response = await axios.post(apiURL, newUser, config);
            console.log(`User ${i + 1}/${count} registered: ${response.data.id}`);
        } catch (error) {
            if (axios.isAxiosError(error)) {
                // TypeScript now knows 'error' has 'response', 'status', etc.
                console.error(`Status: ${error.response?.status}`);
                console.error(`Data:`, error.response?.data);
            } else {
                // Handle non-axios errors (like code crashes)
                console.error('An unexpected error occurred:', error);
            }    
        }
    }
}
