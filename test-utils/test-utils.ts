const userData = require("../test-data/registerUserData.json");

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

export function generateRandomuserData() {

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
        firstName: FIRST_NAME,
        lastName: LAST_NAME,
        dob: DOB,
        street: STREET,
        postCode: POSTCODE,
        city: CITY,
        state: STATE,
        country: COUNTRY,
        phone: PHONE,
        email: EMAIL,
        password: PASSWORD
    }
}
