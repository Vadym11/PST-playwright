import { Page } from '@playwright/test';
// import { HomePage } from './homePage';
// import { LoginPage } from './loginPage';

export abstract class BasePage {

    protected readonly page: Page;
    
    constructor(page: Page) {
        this.page = page;
    }
}