import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { HeaderCommon } from "./HeaderCommon";

export class MyAccountPage extends BasePage{

    readonly header: HeaderCommon;
    readonly myAccountTitle: Locator;
    
    constructor(page: Page) {
        super(page);
        this.myAccountTitle = page.getByTestId('page-title');
        this.header = new HeaderCommon(page);
    }
}