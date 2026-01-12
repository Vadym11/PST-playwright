import { Locator, Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { HeaderCommon } from "./HeaderCommon";


export class ProductPage extends BasePage {

    private readonly addToCartButton: Locator;
    readonly header: HeaderCommon;

    constructor(page: Page) {
        super(page);
        this.addToCartButton = page.getByTestId('add-to-cart');
        this.header = new HeaderCommon(page);
    }

    async clickAddToCart(): Promise<this> {
        await this.addToCartButton.click();

        return this;
    }

    getAddedToCartPopUp(): Locator {
        // return this.page.getByRole('alert', {name: 'Pruduct added to shopping cart.'});
        return this.page.locator("//div[@aria-label='Product added to shopping cart.']");
    }
}