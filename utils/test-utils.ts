import { User } from '../types/user';
import axios from 'axios';
const userData = require('../test-data/registerUserData.json');
const connection = require('./mysqldb');
import config from '../playwright.config';
import { APIRequestContext, expect } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { APIHandler } from './apiHandler';
import { UserAPI, UserAPICreate } from '../types/usersAPI';
import { PaginatedResponse } from '../types/api-responses';
import { registerUserAPI } from './api-utils';

export const getAPIBaseUrl = () => {
  const baseURL = config.use?.baseURL || '';
  if (baseURL.includes('practicesoftwaretesting.com')) {
    return baseURL.replace('://', '://api.');
  }
  return baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
};

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

/**
 * Returns a random element from an array.
 * @param array The array to select an element from.
 * @returns A random element from the array.
 */
export function getRandomArrayElement(array: any[]) {
  return array[getRandomIntInclusive(0, array.length - 1)];
}

/**
 * Generates random user data for registration.
 * User data is sourced from predefined arrays in registerUserData.json.
 * @returns A User object with random data.
 */
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
    password: PASSWORD,
  };
}

/** Generates random user data for registration using Faker library.
 * @returns A User object with random data.
 */
export function generateRandomuserDataFaker(): User {
  const FIRST_NAME = faker.name.firstName().replaceAll("'", '');
  const LAST_NAME = faker.name.lastName().replaceAll("'", '');
  const DOB = faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0];
  const STREET = faker.address.streetAddress();
  const POSTCODE = faker.address.zipCode();
  const CITY = faker.address.city();
  const STATE = faker.address.state();
  const COUNTRY = faker.address.country();
  const PHONE = faker.phone.number('510########');
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
    email: EMAIL.toLowerCase(),
    password: PASSWORD,
  };
}

export async function registerRandomUser(apiHandler: APIHandler): Promise<User> {
  const user = generateRandomuserDataFaker();

  const response = await registerUserAPI(apiHandler, user);

  console.log(`User with email ${response.email} has been registered via API.`);

  return user;
}

/**
 * Retrieves a user ID from the database by email.
 * @param email The email address of the user.
 * @returns The user ID.
 */
export async function getUserIdByEmail(email: string): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?;', [email]);
    if (rows && rows.length > 0) return rows[0].id;
    await new Promise((resolve) => setTimeout(resolve, 500)); // Wait 500ms
  }

  throw new Error(`User with email ${email} was not found in DB after registration.`);
}

/** Retrieves user data from the API by email using Axios.
 * @param token The authorization token.
 * @param email The email address of the user.
 * @returns The user data.
 */
export async function getUserDataByEmailAxios(token: string, email: string): Promise<any> {
  const apiURL = `${apiBaseURL}/users/search`;

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    params: {
      q: email,
    },
  };

  const response = await axios.get(apiURL, config);

  if (response.data.data.length === 0) {
    throw new Error(`User with email ${email} was not found in API response.`);
  } else {
    return response.data.data[0];
  }
}

/**
 * Retrieves user data from the API by email.
 * @param request The Playwright API request context.
 * @param email The email address of the user.
 * @returns The user data.
 */
// export async function getUserDataByEmailAPI(
//   apiHandler: APIHandler,
//   email: string,
// ): Promise<UserAPI> {
//   const apiURL = `${apiBaseURL}/users/search`;

//   const response = await apiHandler.get<PaginatedResponse<UserAPI>>(apiURL, { q: email });

//   if (!response.data || response.data.length === 0) {
//     throw new Error(`API Error: No user found for email: ${email}`);
//   }

//   return response.data[0];
// }

/** Retrieves user ID from the API by email.
 * @param request The Playwright API request context.
 * @param token The authorization token.
 * @param email The email address of the user.
 * @returns The user ID.
 */
// export async function getUserIdByEmailAPI(apiHandler: APIHandler, email: string): Promise<string> {
//   const user = await getUserDataByEmailAPI(apiHandler, email);

//   return user.id;
// }

/** Deletes a user via API by user ID.
 * @param request The Playwright API request context.
 * @param token The authorization token.
 * @param userID The ID of the user to delete.
 */
export async function deleteUserByIdAPIDeprecated(
  request: APIRequestContext,
  token: string,
  userID: string,
): Promise<number> {
  const apiURL = `${apiBaseURL}/users/${userID}`;

  const payload = {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };

  const response = await request.delete(apiURL, payload);

  return response.status();

  // expect(response.status()).toBe(204);
}

export async function deleteUserByIdAPI(apiHandler: APIHandler, userID: string): Promise<any> {
  const apiURL = `${apiBaseURL}/users/${userID}`;

  return await apiHandler.delete(apiURL);
}

/** Deletes a user and related data from the database by user ID.
 * @param userId The ID of the user to delete.
 */
export async function deleteUserById(userId: string): Promise<void> {
  const [result1] = await connection.execute(
    'DELETE FROM invoice_items WHERE invoice_id = (SELECT id FROM invoices WHERE user_id = ?);',
    [userId],
  );
  console.log(`Cleanup: deleted ${result1.affectedRows} invoice items`);

  const [result2] = await connection.execute(
    'DELETE FROM payments WHERE invoice_id = (SELECT id FROM invoices WHERE user_id = ?);',
    [userId],
  );
  console.log(`Cleanup: deleted ${result2.affectedRows} payments`);

  const [result3] = await connection.execute('DELETE FROM invoices WHERE user_id = ?;', [userId]);
  console.log(`Cleanup: deleted ${result3.affectedRows} invoices`);

  const [result4] = await connection.execute('DELETE FROM users WHERE id = ?;', [userId]);
  console.log(`Cleanup: deleted ${result4.affectedRows} users`);
}

/** Generates and registers multiple users via API.
 * @param userCount The number of users to generate and register.
 * @param adminToken The authorization token.
 */
export async function generateAndRegisterUsers(
  userCount: number,
  adminToken: string,
): Promise<void> {
  const apiURL = `${apiBaseURL}/users/register`;

  const config = {
    headers: {
      Authorization: `Bearer ${adminToken}`,
      'Content-Type': 'application/json',
    },
  };

  for (let i = 0; i < userCount; i++) {
    try {
      const newUser = generateRandomuserData();
      const response = await axios.post(apiURL, newUser, config);
      console.log(`User ${i + 1}/${userCount} registered: ${response.data.id}`);
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
