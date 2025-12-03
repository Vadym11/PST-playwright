import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { HeaderCommon } from "./HeaderCommon";
import { MyAccountPage } from "./MyAccountPage";

export class LoginPage extends BasePage{

    private readonly signInWithGoogle: Locator;
    private readonly emailField: Locator;
    private readonly passwordField: Locator;
    private readonly showPassIcon: Locator;
    private readonly loginButton: Locator;
    private readonly registerLink: Locator;
    private readonly forgotPasswordLink: Locator;
    public readonly invalidEmailFormatMsg: Locator;
    public readonly header: HeaderCommon;

    constructor(page: Page) {
        super(page);
        this.signInWithGoogle = page.getByRole('button', {name: ' Sign in with Google '});
        this.emailField = page.getByTestId('email');
        this.passwordField = page.getByTestId('password');
        this.showPassIcon = page.locator('btn btn-outline-secondary');
        this.loginButton = page.getByTestId('login-submit');
        this.registerLink = page.getByRole('link', {name: 'Register your account'});
        this.forgotPasswordLink = page.getByRole('link', {name: 'Forgot your Password?'});
        this.invalidEmailFormatMsg = page.getByTestId('email-error');
        this.header = new HeaderCommon(page);
    }

    async clickSignInWithGoogle(): Promise<void> {
        await this.signInWithGoogle.click();
    } 

    async enterEmailAddress(email: string): Promise<void> {
        await this.emailField.fill(email);
    }

    async enterPassword(password: string): Promise<void> {
        await this.passwordField.fill(password);
    }

    async clickShowPassword(): Promise<void> {
        await this.showPassIcon.click();
    }

    async clickLoginButton(): Promise<void> {
        await this.loginButton.click();
    }

    async login(email: string, password: string): Promise<void> {
        await this.enterEmailAddress(email);
        await this.enterPassword(password);
        await this.clickLoginButton()
    }

    async loginSuccess(email: string, password: string): Promise<MyAccountPage> {
        await this.login(email, password);
        
        return new MyAccountPage(this.page); 
    }

    async loginFail(email: string, password: string): Promise<LoginPage> {
        await this.login(email, password);

        return this;    
    }

    async clickRegisterLink(): Promise<void> {
        await this.registerLink.click();
    }

    async clickForgotPassLink(): Promise<void> {
        await this.forgotPasswordLink.click();
    } 
}