import { User } from "../types/user";
import axios, { AxiosResponse } from 'axios';
const userData = require("../test-data/registerUserData.json");
const connection = require('../test-utils/mysqldb');
import config from '../playwright.config';

export const getBaseUrl = () => {

    return config.use?.baseURL;
}

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

    const FIRST_NAME = getRandomArrayElement(userData.firstNames);
    const LAST_NAME = getRandomArrayElement(userData.lastNames);
    const DOB = getRandomArrayElement(userData.dob);
    const STREET = getRandomArrayElement(userData.streets);
    const POSTCODE = getRandomArrayElement(userData.postcodes);
    const CITY = getRandomArrayElement(userData.cities);
    const STATE = getRandomArrayElement(userData.states);
    const COUNTRY = getRandomArrayElement(userData.countries);
    const PHONE = getRandomArrayElement(userData.phones);
    const EMAIL = `${FIRST_NAME}.${LAST_NAME}@gmail.com`;
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
        email: EMAIL,
        password: PASSWORD
    }
}

export async function  getUserIdByEmail(email: string): Promise<string> {
    for (let i = 0; i < 5; i++) {
        const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?;', [email]);
        if (rows && rows.length > 0) return rows[0].id;
        await new Promise(resolve => setTimeout(resolve, 500)); // Wait 500ms
    }
    
    throw new Error(`User with email ${email} was not found in DB after registration.`);
}

export async function getUserIdByEmailAPI(token: string, email: string): Promise<string> {
    const baseURL = getBaseUrl();

    const payload = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    }

    const users = await axios.get(`${baseURL}/api/users/`, payload);

    const user = users.data.data.find((user: any) => user.email === email);
    
    if (user) {
        return user.id;
    } else {
        throw new Error(`User with email ${email} was not found in API response.`);
    }
}

export async function deleteUserByIdAPI(userID: string, token: string): Promise<AxiosResponse> {
    const baseURL = getBaseUrl();

    const payload = {
        headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
        }
    }
    
    const response = await axios.delete(`${baseURL}/api/users/${userID}`, payload);

    return response;
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
