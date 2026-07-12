import { CreateUser } from '@models/api-user';
import axios from 'axios';
import fs from 'fs';
import connection from '@utils/mysql-db';
import config from '@playwright.config';
import { expect, Locator } from '@playwright/test';
import { faker } from '@faker-js/faker';
import { APIHandler } from '@utils/api-handler';
import { UserAPI } from '@api-models/user';
import { Product } from '@models/api-product';
import { GetBrand } from '@models/api-brand';
import { GetCategoriesResponse } from '@models/api-category';
import { ProductImage } from '@models/api-product-image';
import { ResultSetHeader, RowDataPacket } from 'mysql2';
import path from 'path';
import { jwtDecode } from 'jwt-decode';
import { StorageState } from '@models/storage-state';
import { ProductDetails } from '@models/product-details';

export const baseURL = process.env.BASE_URL;
export const apiBaseURL = process.env.API_URL;

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
  const dataFilePath = path.join(process.cwd(), './lib/data-factory/registerUserData.json');
  const userData = JSON.parse(fs.readFileSync(dataFilePath, 'utf8'));
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

/**
 * Helper method to get a random value from an enum.
 * @param enumObj
 * @returns random value from the enum
 */
function randomEnumValue<T extends object>(enumObj: T): T[keyof T] {
  const values = Object.values(enumObj) as T[keyof T][];
  return values[Math.floor(Math.random() * values.length)];
}

/**
 * Maps a Product object to a ProductDetails object.
 * @param product The Product object to map.
 * @returns The mapped ProductDetails object.
 */
export function mapToProductDetails(product: Product): ProductDetails {
  return {
    name: product.name,
    description: product.description,
    price: product.price,
    stock: product.stock,
    isLocationOffer: product.is_location_offer === 1,
    isItemForRent: product.is_rental === 1,
    co2Rating: product.co2_rating,
    brand: product.brand_id,
    category: product.category_id,
    image: product.product_image_id,
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
  const name = faker.commerce.productName();
  const description = faker.commerce.productDescription();
  const price = parseFloat(faker.commerce.price(10, 200, 2));
  const isLocationOffer = faker.helpers.arrayElement([0, 1]);
  const isItemForRent = faker.helpers.arrayElement([0, 1]);
  const co2Rating = faker.helpers.arrayElement(['A', 'B', 'C', 'D', 'E']);
  const categoryId = faker.helpers.arrayElement(await getCategoryIDs(apiHandler));
  const brandId = faker.helpers.arrayElement(await getBrandIDs(apiHandler));
  const productImageId = faker.helpers.arrayElement(await getImageIDs(apiHandler));
  let stock: number | null = getRandomIntInclusive(0, 100);

  if (isItemForRent === 1) stock = null;

  console.log(`Generated Product Name: ${name}`);

  const product: Product = {
    name: name,
    description: description,
    price: price,
    is_location_offer: isLocationOffer,
    is_rental: isItemForRent,
    co2_rating: co2Rating,
    category_id: categoryId,
    brand_id: brandId,
    product_image_id: productImageId,
    stock: stock,
  };

  return product;
}

export async function generateRandomProductDetails(
  apiHandler: APIHandler,
): Promise<ProductDetails> {
  const product = await generateRandomProductData(apiHandler);

  return mapToProductDetails(product);
}

export async function getCategoryIDs(apiHandler: APIHandler): Promise<string[]> {
  const categoryIDs: string[] = [];
  const categories = await apiHandler.get<GetCategoriesResponse[]>('/categories');

  for (const category of categories) {
    categoryIDs.push(category.id);
  }

  return categoryIDs;
}

export async function getBrandIDs(apiHandler: APIHandler): Promise<string[]> {
  const brandIDs: string[] = [];
  const brands = await apiHandler.get<GetBrand[]>('/brands');

  for (const brand of brands) {
    brandIDs.push(brand.id);
  }

  return brandIDs;
}

export async function getImageIDs(apiHandler: APIHandler): Promise<string[]> {
  const imageIDs: string[] = [];
  const images = await apiHandler.get<ProductImage[]>('/images');

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

  const response = await new UserAPI(apiHandler).register(user);

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

export function checkTokenExpiry(token: string | undefined): boolean {
  if (!token) {
    console.log('Expired (No token provided)');
    return true;
  }

  try {
    const decoded = jwtDecode(token);
    const currentTimePlusBuffer = Date.now() / 1000 + 60;
    const isExpired = decoded.exp ? decoded.exp < currentTimePlusBuffer : true;

    console.log(isExpired ? 'Expired' : 'Valid');
    return isExpired;
  } catch (error) {
    console.log('Expired (Invalid JWT format):', error);
    return true;
  }
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
  // If token is in LocalStorage:
  const targetOrigin = state.origins.find((o) => o.origin === baseURL!);
  const tokenEntry = targetOrigin?.localStorage.find((item) => item.name === 'auth-token');
  if (tokenEntry) tokenEntry.value = newToken;

  // Save it back
  fs.writeFileSync(authFilePath, JSON.stringify(state, null, 2));
}

export async function prefillStorageStateFile(token: string, filePath: string): Promise<void> {
  const state: StorageState = {
    cookies: [],
    origins: [
      {
        origin: baseURL!,
        localStorage: [
          {
            name: 'auth-token',
            value: token,
          },
        ],
      },
    ],
  };

  await writeFile(filePath, state);
}

export async function writeFile(filePath: string, data: unknown): Promise<void> {
  try {
    await fs.promises.mkdir(path.dirname(filePath), { recursive: true });
    await fs.promises.writeFile(filePath, JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error(`Failed to write file at ${filePath}`, { cause: error });
  }
}

export async function deleteFile(filePath: string): Promise<void> {
  try {
    await fs.promises.rm(filePath);
  } catch (error) {
    throw new Error(`Failed to delete file at ${filePath}`, { cause: error });
  }
}

export function isValidInvoiceDate(dateStr: string): boolean {
  // 1. Check the exact string structure format using a Regular Expression
  const regex = /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/;
  if (!regex.test(dateStr)) return false;

  // 2. Parse the individual string components
  const [datePart, timePart] = dateStr.split(' ');
  const [year, month, day] = datePart.split('-').map(Number);
  const [hour, minute, second] = timePart.split(':').map(Number);

  // 3. Create a Date object (Note: Month index is 0-based in JS)
  const date = new Date(year, month - 1, day, hour, minute, second);

  // 4. Verify components match to prevent automatic JS overflow rolling
  // (e.g., prevents "2026-02-30" from rolling over into March)
  return (
    date.getFullYear() === year &&
    date.getMonth() === month - 1 &&
    date.getDate() === day &&
    date.getHours() === hour &&
    date.getMinutes() === minute &&
    date.getSeconds() === second
  );
}
