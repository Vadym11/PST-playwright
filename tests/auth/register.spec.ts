import test, { expect } from "@playwright/test";
import { HomePage } from "../../pages/HomePage";
import { LoginPage } from "../../pages/LoginPage";
import { getRandomIntInclusive } from "../../test-utils/test-utils";
import path from "path";

// test.use({ storageState: path.join(__dirname, '.authFile/userLocal.json') });
test.describe.serial('Registration feature', () => {

    const firstNames: string[] = [
        "Liam",
        "Olivia",
        "Noah",
        "Emma",
        "Oliver",
        "Charlotte",
        "Elijah",
        "Amelia",
        "James",
        "Sophia"
    ];

    const lastNames: string[] = [
        "Smith",
        "Johnson",
        "Williams",
        "Brown",
        "Jones",
        "Garcia",
        "Miller",
        "Davis",
        "Rodriguez",
        "Martinez"
    ];

    const FIRST_NAME = firstNames[getRandomIntInclusive(0, 9)];
    const LAST_NAME = lastNames[getRandomIntInclusive(0, 9)];

    const DOB = "" + (1990 + getRandomIntInclusive(0, 9)) + '-04' + '-11';
    const STREET = "142 Smilyva Street";
    const POSTCODE = "33056";
    const CITY = "Smila";
    const STATE = "Sumy";
    const COUNTRY = "Ukraine"
    const PHONE = "380965487375"
    const EMAIL = `${FIRST_NAME}.${LAST_NAME}@gmail.com`
    const PASSWORD = "Qwerty**12345"

    let token: string;
    let newUserId: string;

    const connection = require('../../test-utils/mysqldb');

    test('Register new user: happy path', async ({page}) => {

        await test.step('Register a new user', async () => {
            const homePage = await new HomePage(page).goTo();

            await homePage.header.clickSignInLink();

            const registerPage = await new LoginPage(page).clickRegisterLink();

            await registerPage.enterFirstName(FIRST_NAME);
            await registerPage.enterLastName(LAST_NAME);
            await registerPage.enterDob(DOB);
            await registerPage.enterStreet(STREET);
            await registerPage.enterPostCode(POSTCODE);
            await registerPage.enterCity(CITY);
            await registerPage.enterState(STATE);
            await registerPage.selectCountry(COUNTRY);
            await registerPage.enterPhone(PHONE);
            await registerPage.enterEmailAddress(EMAIL);
            await registerPage.enterPassword(PASSWORD);
            
            const loginPage = await registerPage.clickRegisterButton();

            await expect(loginPage.getLoginHeader()).toContainText('Login');

            console.log(`User with email ${EMAIL} has registered.`)
        })

        await test.step('Verify created user in DB', async () => {
           
            const [rows, fieldsss] = await connection.execute('SELECT * FROM users ORDER BY updated_at DESC LIMIT 1;');
            const user = rows[0];

            expect(user.first_name).toBe(FIRST_NAME);
            expect(user.last_name).toBe(LAST_NAME);
            expect(user.email).toBe(EMAIL);
        })
    })

    test('Register new user: user exists', async ({page}) => {
        
        const homePage = await new HomePage(page).goTo();

        await homePage.header.clickSignInLink();

        const registerPage = await new LoginPage(page).clickRegisterLink();

        await registerPage.enterFirstName(FIRST_NAME);
        await registerPage.enterLastName(LAST_NAME);
        await registerPage.enterDob(DOB);
        await registerPage.enterStreet(STREET);
        await registerPage.enterPostCode(POSTCODE);
        await registerPage.enterCity(CITY);
        await registerPage.enterState(STATE);
        await registerPage.selectCountry(COUNTRY);
        await registerPage.enterPhone(PHONE);
        await registerPage.enterEmailAddress(EMAIL);
        await registerPage.enterPassword(PASSWORD);
        
        
        await registerPage.clickRegisterButton();

        await expect(registerPage.getCustomerExistMessage())
            .toContainText('A customer with this email address already exists.');
    })

    test('Cleanup: delete new user', async () => {

        const [result] = await connection.execute('DELETE FROM users WHERE email = ?;', [EMAIL]);

        expect(result.affectedRows).toBe(1);
        expect(result.warningStatus).toBe(0)
    })
})