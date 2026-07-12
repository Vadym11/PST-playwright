# PST-Playwright

End-to-end test automation suite for [Practice Software Testing (PST) Toolshop](https://practicesoftwaretesting.com) application. Combines UI and API tests to validate a full e-commerce platform — authentication, product catalog, shopping cart, and checkout flows.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Running Tests](#running-tests)
- [Test Coverage](#test-coverage)
  - [UI Tests](#ui-tests)
  - [API Tests](#api-tests)
- [Architecture](#architecture)
  - [Page Object Models](#page-object-models)
  - [API Models](#api-models)
  - [Fixtures](#fixtures)
  - [Utilities](#utilities)
- [CI/CD](#cicd)
- [Docker](#docker)
- [BrowserStack](#browserstack)

---

## Overview

PST-Playwright tests a full e-commerce toolshop application across two layers:

- **UI tests** — browser-level flows using Page Object Models
- **API tests** — direct REST API validation

Key features under test:
- User registration, login, logout, and admin login
- Product catalogue search, filtering, sorting, and pagination
- Shopping cart and checkout flows (guest and registered users, multiple payment methods)
- Invoice verification
- User account management (profile, favorites)
- Admin product CRUD operations

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| [Playwright Test](https://playwright.dev/) | ^1.53.1 | E2E testing framework |
| [TypeScript](https://www.typescriptlang.org/) | ^5.x | Test code (editor/lint feedback only — no `tsc` build step) |
| [@faker-js/faker](https://fakerjs.dev/) | ^7.6.0 | Dynamic test data generation |
| [mysql2](https://github.com/sidorares/node-mysql2) | ^3.16.0 | Direct DB queries/cleanup against the app database |
| [axios](https://axios-http.com/) | ^1.13.2 | Auxiliary HTTP calls in test utilities |
| [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/) | ^9.x / ^3.x | Code quality & formatting |
| [Husky](https://typicode.github.io/husky/) + lint-staged | ^9.x / ^16.x | Pre-commit lint/format hooks |
| [browserstack-node-sdk](https://www.browserstack.com/docs/automate/playwright) | ^1.49.8 | Cross-browser runs on BrowserStack |
| [dotenv](https://github.com/motdotla/dotenv) | ^17.x | Environment variable loading |

---

## Project Structure

```
PST-Playwright/
├── .github/
│   └── workflows/
│       └── Build-And-Run-Tests.yaml   # GitHub Actions CI/CD pipeline
├── _docker/                           # Dockerfiles for app services + Playwright test image
├── k8s/                                # Kubernetes manifests (app-under-test + test runner)
├── .cmd/
│   ├── run-tests.sh                    # Local test runner helper
│   └── pst-port-forward.sh             # Port-forward to a K8s cluster
├── lib/
│   ├── pages/                          # Page Object Model classes (+ admin/, account/, shoppingCart/)
│   ├── api-models/                     # Class-based REST clients per resource
│   ├── utils/                          # API handler, MySQL pool, data generation, misc helpers
│   ├── fixtures/                       # Playwright fixtures (API, auth/storage-state, DB, catalogue)
│   ├── models/                         # TypeScript types for API/domain objects
│   └── data-factory/                   # Static JSON data used by legacy random-data generators
├── tests/
│   ├── E2E/                            # UI end-to-end specs (admin, checkout, invoices, catalogue, account)
│   ├── api/                            # Pure API specs
│   └── auth/                           # Login/register UI specs
├── playwright/.auth/                   # Generated storage-state files (git-ignored)
├── playwright.config.ts                # Playwright configuration
├── entrypoint.js                       # CI container entry point with Slack notifications
├── eslint.config.js                    # ESLint configuration
├── tsconfig.json                       # TypeScript configuration (path aliases, noEmit)
├── browserstack.yml                    # BrowserStack SDK configuration
└── package.json                        # Dependencies and scripts
```

---

## Getting Started

### Prerequisites

- **Node.js** 20+
- **npm** 9+
- A running instance of the PST Toolshop app (or use the public demo at `https://practicesoftwaretesting.com`)
- MySQL connection details for the app's database (only needed for tests that hit the DB directly)

### Installation

```bash
git clone <repo-url>
cd PST-Playwright
npm install
npx playwright install --with-deps   # download browser binaries
```

### Environment Variables

Copy the example below into a `.env` file at the project root:

```bash
BASE_URL=https://practicesoftwaretesting.com
# API_URL is derived from BASE_URL automatically if not set (see playwright.config.ts)

EMAIL=admin@practicesoftwaretesting.com
PASSWORD_=welcome01

EMAIL_USER=customer@practicesoftwaretesting.com
PASSWORD_USER=welcome01

# App database connection (only needed for tests that hit the DB directly)
MYSQL_HOST=
MYSQL_PORT=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=

USER_NAME=      # BrowserStack username (only needed for BrowserStack runs)
ACCESS_KEY=     # BrowserStack access key
```

| Variable | Description |
|----------|-------------|
| `BASE_URL` | Application base URL |
| `EMAIL` | Admin account email, used by `APIHandler`/admin fixtures |
| `PASSWORD_` | Admin account password (trailing underscore is intentional) |
| `EMAIL_USER` | Standard user account email |
| `PASSWORD_USER` | Standard user account password |
| `MYSQL_HOST/PORT/USER/PASSWORD/DATABASE` | App database connection, for tests that query MySQL directly |
| `USER_NAME` / `ACCESS_KEY` | BrowserStack credentials |

If you're testing against a self-hosted deployment (e.g. in Kubernetes) rather than the public site, forward the app and DB ports first:

```bash
./.cmd/pst-port-forward.sh
```

Alternatively, run the app locally with Docker Compose instead of a K8s cluster — useful for quick local runs without cluster access. Use the **official Toolshop app repo's own Docker Compose setup** for this, not `docker-compose.k8s.yml` in this repo (see below for what that one is for):

```bash
git clone https://github.com/testsmith-io/practice-software-testing.git
cd practice-software-testing
echo "SPRINT=sprint5" > .env
docker compose up -d
docker compose exec laravel-api php artisan migrate:fresh --seed
```

See the [official Docker setup docs](https://testsmith-io.github.io/practice-software-testing/#/getting-started?id=docker-setup) for details. That compose file exposes:

| URL | Description |
|-----|--------------|
| `http://localhost:4200` | Angular UI (`ng serve`) |
| `http://localhost:8091` | REST API |
| `http://localhost:3306` | MariaDB |

Point this project's `.env` at it:

```bash
BASE_URL=http://localhost:4200
MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=root
MYSQL_DATABASE=practice
```

`API_URL` doesn't need to be set — `playwright.config.ts` has a dedicated case for `http://localhost:4200` that derives `http://localhost:8091` automatically (matching this compose setup's ports).

---

## Running Tests

```bash
# Run all tests (headless)
npx playwright test
npm run test:all

# Run via helper script (or --headed for headed mode)
./.cmd/run-tests.sh
./.cmd/run-tests.sh --headed

# Run API tests only
npm run test:api

# Open the last HTML report
npm run report
```

**Common options:**

```bash
# Run a single spec file
npx playwright test tests/E2E/adminPanel.spec.ts

# Run a single test by title/ID
npx playwright test -g "TC-ADMIN-003"

# Run tests by tag
npx playwright test --grep-tag @admin

# Only the configured browser project (others are commented out in config)
npx playwright test --project=chromium
```

Test titles follow a `TC-<AREA>-<NUMBER>` convention (e.g. `TC-ADMIN-003 - Admin: Create New Product`) with Playwright tag metadata (`{ tag: ['@admin', '@products'] }`) for filtering via `-g`/`--grep`/`--grep-tag`.

---

## Test Coverage

### UI Tests

| Spec | What it covers |
|------|---------------|
| `tests/auth/login.spec.ts` | Login happy path, incorrect password/email format, non-existent email, empty fields, logout, admin login, admin panel access control |
| `tests/auth/register.spec.ts` | New user registration happy path, duplicate-user registration error |
| `tests/E2E/productCatalogueSearch.spec.ts` | Product listing, filter by category/price range, search by name (with/without results), product detail page, sort by price, pagination |
| `tests/E2E/checkOutFlow.spec.ts` | Checkout as a logged-in existing user; checkout as a logged-out (guest) user |
| `tests/E2E/checkOutPaymentMethods.spec.ts` | Checkout across payment methods (cash on delivery, bank transfer, credit card, gift card, buy-now-pay-later) |
| `tests/E2E/invoiceVerification.spec.ts` | Invoice details verification for a logged-in user's completed order |
| `tests/E2E/userAccount.spec.ts` | User profile data verification, favorite products |
| `tests/E2E/adminPanel.spec.ts` | Admin dashboard load, view/create/edit/delete products, product form required-field validation |

### API Tests

| Spec | What it covers |
|------|---------------|
| `tests/api/user.spec.ts` | Get all users, get current user, change password, reset password, refresh token, update user (full & partial), logout |
| `tests/api/product.spec.ts` | Get all products, get by ID, get related products, update/patch product, search by name |

---

## Architecture

### Page Object Models

Located in `lib/pages/`. All classes extend `BasePage`. Action methods return `this` (for chaining) or the next Page object for navigation, so specs read as fluent chains.

| Class | Page / Component |
|-------|-----------------|
| `BasePage` | Shared methods across all pages |
| `HomePage` | Landing page navigation |
| `HeaderCommon` | Shared header/navigation component |
| `ProductCataloguePage` | Product listing, search, filtering, sorting, pagination |
| `ProductPage` | Product details, add-to-cart |
| `LoginPage` | Login form, admin/customer access checks |
| `RegisterPage` | Registration form |
| `ForgotPasswordPage` | Password reset flow |
| `ContactPage` | Contact form |
| `InvoiceDetailsPage` | Invoice details verification |
| `UserAccountPage` | User account shell/navigation |
| `account/ProfilePage` | Profile data |
| `account/FavoritesPage` | Favorite products |
| `account/InvoicesPage` | Invoice listing |
| `admin/AdminDashboardPage` | Admin dashboard |
| `admin/AdminProductsPage` | Admin product listing |
| `admin/AdminProductCreationPage` | Admin product create/edit form |
| `shoppingCart/ShoppingCartMainPage` | Cart display |
| `shoppingCart/ShoppingCartLoginPage` | Cart sign-in flow |
| `shoppingCart/ShoppingCartBillingPage` | Billing address entry |
| `shoppingCart/ShoppingCartPaymentPage` | Payment method selection and confirmation |

### API Models

Located in `lib/api-models/`. Wrap `APIHandler` in per-resource classes — the only pattern for API access.

| Class | Endpoints covered |
|-------|------------------|
| `UserAPI` | Register, login, logout, get current user/all users, update/patch, forgot/change password, refresh token, delete |
| `ProductAPI` | Create, update/patch, get all (paginated), get by ID, get related products, search by name, delete |
| `InvoiceAPI` | Invoice-related endpoints |

### Fixtures

Located in `lib/fixtures/`, each exports its own `test` layered via `.extend`:

| File | Provides |
|------|---------|
| `apiFixtures.ts` | Base: `apiHandler`, `adminToken`, `productApi`, `userApi`, and worker-scoped `apiHandlerWorker`/`adminTokenWorker`/`userApiWorker`/`baseAPIUrl` |
| `catalogueFixtures.ts` | `cataloguePage`, pre-navigated to the product catalogue |
| `dbFixtures.ts` | Direct MySQL query fixtures (`getNewUserId`) |
| `getAuthenticatedUser.ts` | `userState` — registers a test-scoped user via API and writes a `storageState` file so specs can skip UI login; deletes the user/file on teardown |
| `getAuthenticatedUserGlobal.ts` | `authenticatedUserDataGlobal` — refreshes a shared/global user's token and injects it into the page when near expiry |
| `adminStorageState.ts` | Worker-scoped admin `storageState` file, built from `adminTokenWorker` |

`tests/auth.setup.ts`/`tests/auth.teardown.ts` are a separate setup/teardown pair used only by the BrowserStack SDK project config, not by `playwright.config.ts` — the active local/CI pattern is the per-fixture storage-state files above.

### Utilities

Located in `lib/utils/`:

| File | Contents |
|------|----------|
| `api-handler.ts` | `APIHandler` — low-level HTTP client (get/post/update/patch/delete, admin auth) all API access goes through |
| `mysql-db.ts` | MySQL connection pool |
| `test-utils.ts` | `generateRandomuserDataFaker`/`generateRandomProductData` (Faker-based, preferred), `generateRandomUserData` (legacy), storage-state file helpers, token expiry/refresh helpers, `assertWithinMargin` |
| `project-utils.ts` | `completeCheckoutAndVerifyBilling` and other cross-page checkout helpers |

**Type definitions** in `lib/models/` and `lib/api-models/`: `api-product.ts`, `api-user.ts`, `api-brand.ts`, `api-category.ts`, `api-product-image.ts`, `api-responses.ts`, `billing-fields.ts`, `payment-methods.ts`, `product-details.ts`, `product-image.ts`, `storage-state.ts`.

Import modules via the configured path aliases rather than relative paths: `@pages/*`, `@utils/*`, `@models/*`, `@fixtures/*`, `@api-models/*`, `@data-factory/*`, `@auth/*` (see `tsconfig.json`).

---

## CI/CD

The GitHub Actions workflow (`.github/workflows/Build-And-Run-Tests.yaml`) triggers on push and pull requests to `main`.

**Pipeline stages:**

1. **Detect changes** — skips the Docker build unless `tests/`, `lib/`, `entrypoint.js`, or the Dockerfile changed
2. **Build & push** — builds the Playwright Docker image and pushes it
3. **Deploy to GKE** — spins up a fresh ephemeral namespace with the Toolshop app + MySQL (`k8s/*.yaml`)
4. **Seed database** — runs migrations and seeds test data
5. **Run tests** — applies a Playwright test Job, executes the suite via `entrypoint.js`, and waits for `/tests/tests_finished.txt`
6. **Collect artifacts** — uploads the HTML report as a build artifact
7. **Cleanup** — tears down the ephemeral namespace
8. **Notify** — posts a pass/fail summary to Slack (`SLACK_WEBHOOK_URL`)

Other workflow files (`*.yml.ignore`) are disabled/parked.

---

## Docker

The `_docker/Dockerfile.playwright` image is used in CI, alongside Dockerfiles for the app's own services (`Dockerfile.api`, `Dockerfile.web`, `Dockerfile.apiweb`, `Dockerfile.cron`, `Dockerfile.ui`). To build the test image locally:

```bash
docker build -f _docker/Dockerfile.playwright -t pst-playwright .
```

To run tests inside the container:

```bash
docker run --rm \
  -e BASE_URL=https://practicesoftwaretesting.com \
  -e EMAIL=admin@practicesoftwaretesting.com \
  -e PASSWORD_=welcome01 \
  -e EMAIL_USER=customer@practicesoftwaretesting.com \
  -e PASSWORD_USER=welcome01 \
  pst-playwright
```

---

## BrowserStack

Cross-browser/device runs are configured in `browserstack.yml`. With `USER_NAME`/`ACCESS_KEY` set, run tests through the BrowserStack SDK wrapper instead of calling `playwright test` directly:

```bash
npx browserstack-node-sdk playwright test
```

`browserstackLocal: true` is set in `browserstack.yml` (needed since the app-under-test is typically a private/self-hosted deployment rather than public), so the BrowserStack Local tunnel app must be installed and running to route traffic from BrowserStack's cloud browsers to your app. See BrowserStack's [Local testing docs](https://www.browserstack.com/docs/automate/selenium/local-testing-introduction) for setup.
