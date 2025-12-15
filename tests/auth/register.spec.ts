import test, { expect } from "@playwright/test";
import { HomePage } from "../../pages/homePage";
import { LoginPage } from "../../pages/loginPage";
import { getRandomIntInclusive } from "../../test-utils/test-utils";

test.describe('Registration feature', () => {

    test('Register new user: happy path', async ({page}) => {
        
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
        const DOB = "" + (1990 + getRandomIntInclusive(0, 9));
        const STREET = "142 Smilyva Street";
        const POSTCODE = "33056";
        const CITY = "Smila";
        const STATE = "Sumy";
        const COUNTRY = "Ukraine"
        const PHONE = "380965487345"
        const EMAIL = `${FIRST_NAME}.${LAST_NAME}@gmail.com`
        const PASSWORD = "Qwerty**12345"

        const homePage = await new HomePage(page).goTo();

        // await homePage.header.clickUserNavMenu();
        // await homePage.header.clickSignOut();

        await homePage.header.clickSignInLink();

        const registerPage = await new LoginPage(page).clickRegisterLink();

        await registerPage.enterFirstName(FIRST_NAME);
        await registerPage.enterLastName(LAST_NAME);
        await registerPage.selectCountry('Ukraine');
        await registerPage.clickRegisterButton();

        await expect(registerPage.getDobRequiredMessage()).toContainText('Date of Birth is required');
    })
})