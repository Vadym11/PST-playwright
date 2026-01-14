import { Locator } from '@playwright/test';

export interface BillingFields {
    street: Locator;
    city: Locator;
    state: Locator;
    postCode: Locator;
}