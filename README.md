# PST Playwright

Playwright + TypeScript test suite (UI and API) for the [Practice Software Testing](https://practicesoftwaretesting.com) ("Toolshop") e-commerce demo app. Covers authentication, product catalogue, shopping cart/checkout, user account, invoices, the admin panel, and the underlying REST API.

## Tech stack

- [Playwright Test](https://playwright.dev/) + TypeScript
- Page Object Model for UI flows, a class-based API client layer for REST calls
- MySQL (`mysql2`) for direct DB assertions/cleanup
- ESLint + Prettier + Husky/lint-staged
- BrowserStack (`browserstack-node-sdk`) for cross-browser runs
- Dockerized test runner deployed to GKE via GitHub Actions

## Prerequisites

- Node.js 20+
- Access to a running instance of the Toolshop app (`BASE_URL`) and its API
- MySQL connection details for the app's database (only needed for tests that hit the DB directly)

## Setup

```bash
npm install
npx playwright install --with-deps   # download browser binaries
```

Create a `.env` file in the project root with the following variables:

```bash
BASE_URL=          # e.g. https://practicesoftwaretesting.com or http://localhost:4200
# API_URL is derived from BASE_URL automatically if not set (see playwright.config.ts)

EMAIL=             # admin user email, used by APIHandler/admin fixtures
PASSWORD_=         # admin user password (trailing underscore is intentional, not a typo)
EMAIL_USER=        # standard user email
PASSWORD_USER=     # standard user password

# App database connection (only needed for tests that hit the DB directly)
MYSQL_HOST=
MYSQL_PORT=
MYSQL_USER=
MYSQL_PASSWORD=
MYSQL_DATABASE=

USER_NAME=         # BrowserStack username (only needed for BrowserStack runs)
ACCESS_KEY=        # BrowserStack access key
```

If you're testing against a self-hosted deployment (e.g. in Kubernetes) rather than the public site, forward the app and DB ports first:

```bash
./.cmd/pst-port-forward.sh
```

## Running tests

```bash
npx playwright test                          # run the full suite (headless)
./.cmd/run-tests.sh                          # same, via helper script
./.cmd/run-tests.sh --headed                 # headed mode

npx playwright test tests/E2E/adminPanel.spec.ts   # a single spec file
npx playwright test -g "TC-ADMIN-003"              # a single test by title
npx playwright test --grep-tag @admin              # tests tagged @admin
npx playwright test --project=chromium             # only the configured browser project

npm run test:api                             # API tests only (tests/api/*.spec.ts)
npm run report                               # open the last HTML report
```

Test titles follow a `TC-<AREA>-<NUMBER>` convention (e.g. `TC-ADMIN-003 - Admin: Create New Product`) and are tagged (`@admin`, `@products`, `@smoke`, ...) for filtering with `--grep`/`--grep-tag`.

## Linting & formatting

```bash
npm run lint          # eslint
npm run lint:fix       # eslint --fix
npm run format          # prettier --write
npm run format:check    # prettier --check
```

A Husky pre-commit hook runs `lint-staged` (Prettier + ESLint) on staged `.ts` files.

There is no `tsc`/typecheck script — `tsconfig.json` sets `noEmit: true`, so TypeScript is used only for editor/lint feedback. ESLint's `@typescript-eslint` rules are the closest thing to a type check that runs in CI.

## Project structure

```
lib/
  pages/          Page Object classes for UI flows (admin, account, shopping cart, ...)
  api-models/      Class-based REST clients per resource (ProductAPI, UserAPI)
  utils/           API handler, MySQL pool, data generation, misc test helpers
  fixtures/        Playwright fixtures (API client, auth/storage-state, DB, catalogue)
  models/          TypeScript types for API/domain objects
  data-factory/     Static JSON data used by legacy random-data generators

tests/
  E2E/             Full browser flows (admin panel, checkout, invoices, catalogue, account)
  api/             Pure API tests
  auth/            Login/register UI flows
  exp/             Experimental/example specs (not part of the real suite)

k8s/               Kubernetes manifests for deploying the app-under-test + test runner
_docker/           Dockerfiles for the app services and the Playwright test image
.cmd/              Local helper scripts (run tests, port-forward to the cluster)
```

Import modules via the configured path aliases rather than relative paths: `@pages/*`, `@utils/*`, `@models/*`, `@fixtures/*`, `@api-models/*`, `@data-factory/*`, `@auth/*` (see `tsconfig.json`).

## CI

`.github/workflows/Build-And-Run-Tests.yaml` runs on pushes and PRs to `main`. It builds/pushes the Playwright Docker image (only when test-related files changed), deploys the Toolshop app and MySQL into a fresh GKE namespace, runs the suite as a Kubernetes Job, uploads the HTML report as a build artifact, and tears the namespace down. Test results are also posted to Slack via `entrypoint.js`.

## BrowserStack

Cross-browser/device runs are configured in `browserstack.yml`. With `USER_NAME`/`ACCESS_KEY` set, run tests through the BrowserStack SDK wrapper instead of calling `playwright test` directly:

```bash
npx browserstack-node-sdk playwright test
```

`browserstackLocal: true` is set in `browserstack.yml` (needed since the app-under-test is typically a private/self-hosted deployment rather than public), so the BrowserStack Local tunnel app must be installed and running to route traffic from BrowserStack's cloud browsers to your app. See BrowserStack's [Local testing docs](https://www.browserstack.com/docs/automate/selenium/local-testing-introduction) for setup.
