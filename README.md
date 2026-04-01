# PST Playwright

TypeScript Playwright test suite for the Practice Software Testing application. The repository covers browser E2E flows, direct API testing, and a small amount of database-assisted validation.

## What is in this repo

- UI end-to-end tests built on Playwright page objects
- API tests built on top of custom typed API clients
- Auth setup that creates a user through the API and reuses Playwright storage state for UI tests
- MySQL-backed fixtures for cases that need direct DB lookup
- GitHub Actions workflow that deploys the app stack to Kubernetes and runs the suite there

## Repository layout

```text
.
├── lib
│   ├── api-models     # Typed API wrappers (ProductAPI, UserAPI, ...)
│   ├── data-factory   # Static test data inputs
│   ├── fixtures       # Custom Playwright fixtures
│   ├── models         # Shared TypeScript models/interfaces
│   ├── pages          # Page object model for UI tests
│   └── utils          # API helpers, auth helpers, DB helpers, shared test utilities
├── tests
│   ├── API            # API-level tests
│   ├── E2E            # Browser journeys
│   └── auth           # Auth tests plus setup/teardown projects
├── k8s                # Kubernetes manifests used by CI
├── _docker            # Dockerfiles for test/runtime images
└── playwright.config.ts
```

## Test architecture

### UI tests

UI flows use page objects from `lib/pages`. A representative path is:

`HomePage -> ProductPage -> ShoppingCart*Page -> account pages`

The Playwright config defines:

- `setup` project: registers a fresh user via API and writes `playwright/.auth/userState.json`
- `chromium` project: depends on `setup` and reuses that storage state
- `teardown` project: clears the token from the saved auth state

### API tests

API tests use fixtures from `lib/fixtures/apiFixtures.ts`:

- `workerApiHandler`: authenticated Playwright request context
- `productApi` / `userApi`: typed API wrappers
- `newUserRegistered`: worker-scoped registered user fixture

The API base URL is derived automatically from `BASE_URL`:

- `https://practicesoftwaretesting.com` -> `https://api.practicesoftwaretesting.com`
- custom local/private URLs -> `${BASE_URL}/api` if `/api` is not already present

### DB-backed helpers

`lib/utils/mysqldb.ts` creates a MySQL connection pool. Only tests that explicitly use DB fixtures need the MySQL environment variables.

## Requirements

- Node.js
- npm
- Playwright browser dependencies
- Access to a target Practice Software Testing environment
- Valid admin credentials for API-authenticated fixtures

## Installation

```bash
npm ci
npx playwright install
```

`postinstall` also updates `browserstack-node-sdk`, so that package may change after install.

## Environment variables

The repo already loads `.env` through `dotenv/config` in `playwright.config.ts`.

Core variables:

| Variable | Required | Purpose |
| --- | --- | --- |
| `BASE_URL` | No | Base app URL. Defaults to `https://practicesoftwaretesting.com`. |
| `EMAIL` | Yes for API/auth fixtures | Admin or privileged user email used by `APIHandler.authenticate()`. |
| `PASSWORD_` | Yes for API/auth fixtures | Password paired with `EMAIL`. |

Database variables, only needed for DB-backed tests/fixtures:

| Variable | Required | Purpose |
| --- | --- | --- |
| `MYSQL_HOST` | No | Defaults to `pst-db`. |
| `MYSQL_PORT` | No | Defaults to `3306`. |
| `MYSQL_USER` | Yes for DB tests | MySQL username. |
| `MYSQL_PASSWORD` | Yes for DB tests | MySQL password. |
| `MYSQL_DATABASE` | Yes for DB tests | Database name. |

## Running tests locally

Run the full suite:

```bash
npx playwright test
```

Run headed:

```bash
.cmd/run-tests.sh --headed
```

Run a specific folder:

```bash
npx playwright test tests/E2E
npx playwright test tests/API
```

Run a specific file:

```bash
npx playwright test tests/E2E/checkOutFlow.spec.ts
```

Open the HTML report after a run:

```bash
npx playwright show-report
```

## Linting and formatting

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
```

## Useful implementation notes

- The suite is configured under `playwright.config.ts`.
- TypeScript path aliases are defined in `tsconfig.json` (`@pages/*`, `@utils/*`, `@fixtures/*`, and others).
- UI tests usually import `test` from `@fixtures/getAuthenticatedUser` when they need a logged-in user.
- API tests usually import `test` from `@fixtures/apiFixtures`.
- Test data is generated with `@faker-js/faker` and a small static factory file in `lib/data-factory/registerUserData.json`.
- Auth state is stored under `playwright/.auth/`.

## CI/CD

The main workflow is `.github/workflows/Build-And-Run-Tests.yaml`.

At a high level it:

1. Detects whether Playwright-related files changed.
2. Builds and pushes a Playwright Docker image when needed.
3. Creates a temporary Kubernetes namespace.
4. Deploys the application stack and seeds the database.
5. Runs the Playwright job inside the cluster.
6. Copies back the Playwright HTML report as a GitHub Actions artifact.
7. Deletes the namespace.

## BrowserStack

`browserstack.yml` and the `browserstack-node-sdk` dependency are present, but BrowserStack is not the default local execution path configured in `playwright.config.ts`.

## Known outputs and generated folders

These directories are expected during local or CI runs:

- `playwright/.auth`
- `playwright-report`
- `test-results`
- `log/`

## Typical workflow for contributors

1. Set the required environment variables.
2. Install dependencies with `npm ci`.
3. Verify the target app and API are reachable from `BASE_URL`.
4. Run a focused spec or folder while developing.
5. Run linting before pushing changes.
