import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
export class RegisterPage extends BasePage {

    private readonly firstNameField: Locator;
    private readonly lastNameField: Locator;
    private readonly dob: Locator;
    private readonly street: Locator;
    private readonly postCode: Locator;
    private readonly city: Locator;
    private readonly state: Locator;
    private readonly country: Locator;
    private readonly phone: Locator;
    private readonly email: Locator;
    private readonly password: Locator;

    constructor(page: Page) {
        super(page);
        this.firstNameField = page.getByTestId('first-name');
        this.lastNameField = page.getByTestId('last-name');
        this.dob = page.getByTestId('dob');
        this.street = page.getByTestId('street');
        this.postCode = page.getByTestId('postal_code');
        this.city = page.getByTestId('city');
        this.state = page.getByTestId('state');
        this.country = page.getByTestId('country');
        this.phone = page.getByTestId('phone');
        this.email = page.getByTestId('email');
        this.password = page.getByTestId('password');
    }

    async enterFirstName(firstName: string): Promise<this> {
        await this.firstNameField.fill(firstName);

        return this;
    }

    async enterLastName(lastName: string): Promise<this> {
        await this.lastNameField.fill(lastName);

        return this;
    }

    async enterDob(dob: string): Promise<this> {
        await this.dob.fill(dob);

        return this;
    }

    async enterStreet(street: string): Promise<this> {
        await this.street.fill(street);

        return this;
    }

    async enterPostCode(postCode: string): Promise<this> {
        await this.postCode.fill(postCode);

        return this;
    }

    async enterCity(city: string): Promise<this> {
        await this.city.fill(city);

        return this;
    }
    
    async enterState(state: string): Promise<this> {
        await this.state.fill(state);

        return this;
    }

    async selectCountry(country: string): Promise<this> {
        await this.country.click();
        await this.page.keyboard.type(country);
        await this.page.keyboard.press('Enter');

        return this;
    }
    
    async clickRegisterButton(): Promise<this> {
        await this.page.getByTestId('register-submit').click();
        
        return this;
    }

    getDobRequiredMessage(): Locator {

        return this.page.getByTestId('dob-error');
    }
}