import { CreateUser } from '@models/api-user';
import axios from 'axios';
import fs from 'fs';
import connection from '@utils/mysqldb';
import config from '@playwright.config';
import { APIRequestContext, expect, Locator } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { APIHandler } from '@utils/apiHandler';
import {
  getAllBrandsAPI,
  getAllCategoriesAPI,
  getAllImagesAPI,
  registerUserAPI,
} from '@utils/api-utils';
import { Product } from '@models/api-product';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import path from 'path';
import { fileURLToPath } from 'url';
import { jwtDecode } from 'jwt-decode';
import { StorageState } from '@models/storage-state';

// Recreate __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getBaseURL(): string {
  return config.use?.baseURL || '';
}

export const baseURL = getBaseURL();

export const getAPIBaseUrl = () => {
  if (baseURL.includes('practicesoftwaretesting.com')) {
    return baseURL.replace('://', '://api.');
  }
  return baseURL.endsWith('/api') ? baseURL : `${baseURL}/api`;
};

export const apiBaseURL = getAPIBaseUrl();

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
export function generateRandomUserData(): CreateUser {
  const userData = JSON.parse(fs.readFileSync('../data-factory/registerUserData.json', 'utf8'));
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
export function generateRandomuserDataFaker(): CreateUser {
  const FIRST_NAME = faker.name.firstName().replaceAll("'", '');
  const LAST_NAME = faker.name.lastName().replaceAll("'", '');
  const DOB = faker.date.birthdate({ min: 18, max: 65, mode: 'age' }).toISOString().split('T')[0];
  const STREET = faker.address.streetAddress();
  const POSTCODE = faker.address.zipCode();
  const CITY = faker.address.city();
  const STATE = faker.address.state();
  const COUNTRY = faker.address.country().substring(0, 40); // Max length 40 chars
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

export async function generateRandomProductData(apiHandler: APIHandler): Promise<Product> {
  const NAME = faker.commerce.productName();
  const DESCRIPTION = faker.commerce.productDescription();
  const PRICE = parseFloat(faker.commerce.price(10, 200, 2));
  const IS_LOCATION_OFFER = faker.helpers.arrayElement([0, 1]);
  const IS_RENTAL = faker.helpers.arrayElement([0, 1]);
  const CO2_RATING = faker.helpers.arrayElement(['A', 'B', 'C', 'D', 'E']);
  const CATEGORY_ID = faker.helpers.arrayElement(await getCategoryIDs(apiHandler));
  const BRAND_ID = faker.helpers.arrayElement(await getBrandIDs(apiHandler));
  const PRODUCT_IMAGE_ID = faker.helpers.arrayElement(await getImageIDs(apiHandler));

  console.log(`Generated Product Name: ${NAME}`);

  const product: Product = {
    name: NAME,
    description: DESCRIPTION,
    price: PRICE,
    is_location_offer: IS_LOCATION_OFFER,
    is_rental: IS_RENTAL,
    co2_rating: CO2_RATING,
    category_id: CATEGORY_ID,
    brand_id: BRAND_ID,
    product_image_id: PRODUCT_IMAGE_ID,
  };

  return product;
}

export async function getCategoryIDs(apiHandler: APIHandler): Promise<string[]> {
  const categoryIDs: string[] = [];
  const categories = await getAllCategoriesAPI(apiHandler);

  for (const category of categories) {
    categoryIDs.push(category.id);
  }

  return categoryIDs;
}

export async function getBrandIDs(apiHandler: APIHandler): Promise<string[]> {
  const brandIDs: string[] = [];
  const brands = await getAllBrandsAPI(apiHandler);

  for (const brand of brands) {
    brandIDs.push(brand.id);
  }

  return brandIDs;
}

export async function getImageIDs(apiHandler: APIHandler): Promise<string[]> {
  const imageIDs: string[] = [];
  const images = await getAllImagesAPI(apiHandler);

  for (const image of images) {
    imageIDs.push(image.id);
  }

  return imageIDs;
}

/**
 * Generates and registers a random user via API.
 * @param apiHandler The API handler instance.
 * @returns The registered User object.
 */

export async function registerRandomUser(apiHandler: APIHandler): Promise<CreateUser> {
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
    const [rows] = await connection.execute<RowDataPacket[]>(
      'SELECT id FROM users WHERE email = ?;',
      [email],
    );
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
  const [result1] = await connection.execute<ResultSetHeader>(
    'DELETE FROM invoice_items WHERE invoice_id = (SELECT id FROM invoices WHERE user_id = ?);',
    [userId],
  );
  console.log(`Cleanup: deleted ${result1.affectedRows} invoice items`);

  const [result2] = await connection.execute<ResultSetHeader>(
    'DELETE FROM payments WHERE invoice_id = (SELECT id FROM invoices WHERE user_id = ?);',
    [userId],
  );
  console.log(`Cleanup: deleted ${result2.affectedRows} payments`);

  const [result3] = await connection.execute<ResultSetHeader>(
    'DELETE FROM invoices WHERE user_id = ?;',
    [userId],
  );
  console.log(`Cleanup: deleted ${result3.affectedRows} invoices`);

  const [result4] = await connection.execute<ResultSetHeader>('DELETE FROM users WHERE id = ?;', [
    userId,
  ]);
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
      const newUser = generateRandomUserData();
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

export const authFile = () => {
  const authFile = 'playwright/.auth/userState.json';

  return path.resolve(process.cwd(), authFile);
};

export const authFilePath = authFile();

export const userDataFile = () => {
  const userDataFile = 'playwright/.auth/userData.json';

  return path.resolve(process.cwd(), userDataFile);
};

export const userDataFilePath = userDataFile();

export const assertWithinMargin = async (locator: Locator, expected: number) => {
  const isInput = await locator.evaluate((el) => el.tagName === 'INPUT');
  const rawVal = isInput ? await locator.inputValue() : await locator.textContent();

  const cleanVal = rawVal?.replace(/[^0-9.]/g, '') || '0';
  const actual = parseFloat(cleanVal);

  const message = `Expected value to be within 0.01 of ${expected}, but got ${actual}`;
  expect(actual, message).toBeGreaterThanOrEqual(expected - 0.01);
  expect(actual, message).toBeLessThanOrEqual(expected + 0.01);
};

export function checkTokenExpiry(token: string) {
  const decoded = jwtDecode(token);
  const currentTimePlusBuffer = Date.now() / 1000 + 60;
  const isExpired = decoded.exp ? decoded.exp < currentTimePlusBuffer : true;

  console.log(isExpired ? 'Expired' : 'Valid');
  return isExpired;
}

export function getCurrentToken(): string {
  const baseURL = (config.use?.baseURL || '').replace(/\/$/, '');
  try {
    const data = readStorageStateFile();

    // 1. Find the correct origin (e.g., your local dev URL)
    const targetOrigin = data?.origins?.find((o) => o.origin === baseURL);

    // 2. Find the entry where the name is specifically 'auth-token'
    const tokenEntry = targetOrigin?.localStorage?.find((item) => item.name === 'auth-token');

    return tokenEntry?.value || '';
  } catch (error) {
    throw new Error(`Failed to read token from storage state file: ${error}`);
  }
}

export function readStorageStateFile(): StorageState {
  try {
    const data = fs.readFileSync(authFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error(`Failed to read storage state file: ${error}`);
  }
}

export function replaceTokenAndWriteToStateFile(
  newToken: string,
  state: StorageState,
  authFilePath: string,
): void {
  // const authFilePath = path.resolve(__dirname, 'playwright/.auth/userState.json');

  // Load the existing state
  // const state: StorageState = readStorageStateFile();

  // If token is in LocalStorage:
  const targetOrigin = state.origins.find((o) => o.origin === baseURL);
  const tokenEntry = targetOrigin?.localStorage.find((item) => item.name === 'auth-token');
  if (tokenEntry) tokenEntry.value = newToken;

  // Save it back
  fs.writeFileSync(authFilePath, JSON.stringify(state, null, 2));
}

export function prefillStorageStateFile(token: string, path: string): void {
  const state: StorageState = {
    cookies: [],
    origins: [
      {
        origin: baseURL,
        localStorage: [
          {
            name: 'auth-token',
            value: token,
          },
        ],
      },
    ],
  };

  fs.writeFileSync(path, JSON.stringify(state, null, 2));
}
