# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A Playwright + TypeScript test suite (UI and API) for the Practice Software Testing / "Toolshop" e-commerce app (`https://practicesoftwaretesting.com`, API at `api.practicesoftwaretesting.com`). Runs locally, against a self-hosted K8s deployment of the app-under-test, or via BrowserStack.

## Commands

```bash
npx playwright test                        # run all tests (headless)
./.cmd/run-tests.sh                         # same, or ./.cmd/run-tests.sh --headed for headed mode
npx playwright test tests/E2E/adminPanel.spec.ts   # run a single spec file
npx playwright test -g "TC-ADMIN-003"       # run a single test by title/ID
npx playwright test --project=chromium      # only browser project defined (others are commented out in config)
npm run test:api                            # run tests/api/*.spec.ts only
npm run report                              # open the last HTML report
npm run lint / npm run lint:fix             # eslint
npm run format / npm run format:check       # prettier
```

There is no `tsc` typecheck script; TypeScript is used only for editor/lint feedback (`tsconfig.json` has `noEmit: true`). ESLint's `@typescript-eslint` rules are the closest thing to a type check that runs in CI.

Env vars come from `.env` (loaded via `dotenv/config` in `playwright.config.ts`): `BASE_URL`, `EMAIL`/`PASSWORD_` (admin), `EMAIL_USER`/`PASSWORD_USER`, `MYSQL_HOST/PORT/USER/PASSWORD/DATABASE`, BrowserStack `USER_NAME`/`ACCESS_KEY`. `API_URL` is derived from `BASE_URL` in `playwright.config.ts` if not set explicitly (see `getAPIBaseUrl`).

Tests against the live DB (`lib/utils/mysql-db.ts`, `lib/fixtures/dbFixtures.ts`) require MySQL connectivity — locally this typically means port-forwarding via `./.cmd/pst-port-forward.sh` to a K8s cluster running the app (see `k8s/`, `_docker/`).

## Architecture

**Path aliases** (`tsconfig.json`, mirrored by Playwright's module resolution): `@pages/*` → `lib/pages`, `@utils/*` → `lib/utils`, `@models/*` → `lib/models`, `@fixtures/*` → `lib/fixtures`, `@data-factory/*` → `lib/data-factory`, `@api-models/*` → `lib/api-models`, `@auth/*` → `playwright/.auth`, `@playwright.config` → `playwright.config.ts`. Always import via these aliases, not relative paths.

**Page Objects** (`lib/pages/**`): all extend `BasePage` (holds `protected readonly page`). Action methods return `this` (for chaining) or the next `Page` object for navigation (e.g. `ProductCataloguePage.openFirstProduct()` returns a `ProductPage`), so specs read as fluent chains (`await new AdminProductsPage(page).open()`, `adminProductsPage.clickEditProduct(name)` → returns `AdminProductCreationPage`). Assertion helper methods live on the page object itself (`assertAdminDashboard()`, `assertProductSavedMessage()`), not in the spec.

**API layer**:
- `APIHandler` (`lib/utils/api-handler.ts`) is the low-level HTTP client (get/post/update/patch/delete, admin auth) all API access goes through.
- `lib/api-models/*` (e.g. `ProductAPI`, `UserAPI`) wrap `APIHandler` in per-resource classes — this is the only pattern for API access, exposed via fixtures as `productApi`/`userApi`. Add new resources here rather than reaching for `apiHandler` directly in specs.

**Fixtures** (`lib/fixtures/*`, each exports its own `test`, layered via `.extend`): `apiFixtures` is the base (`apiHandler`, `adminToken`, `productApi`, `userApi`, plus worker-scoped `apiHandlerWorker`/`adminTokenWorker`/`userApiWorker`/`baseAPIUrl`). `catalogueFixtures` adds `cataloguePage`. `dbFixtures` adds direct MySQL query fixtures (`getNewUserId`). `getAuthenticatedUser`/`getAuthenticatedUserGlobal`/`adminStorageState` build/refresh `storageState` JSON files under `playwright/.auth/` so specs can skip UI login (a test/worker-scoped user is registered via API and its token is written directly into a storage-state file consumed by `page`); each of these fixtures deletes the user/state file it created once the test or worker finishes. Specs import `test` from whichever fixtures file provides what they need (`@fixtures/apiFixtures`, `@fixtures/adminStorageState`, etc.) — never from `@playwright/test` directly. `tests/auth.setup.ts`/`tests/auth.teardown.ts` are a separate setup/teardown pair used only by the BrowserStack SDK project config (`browserstack.yml`), not by `playwright.config.ts` (its own `setup`/`teardown` projects are commented out there) — the active local/CI pattern is the per-fixture storage-state files above.

**Data generation** (`lib/utils/test-utils.ts`): `generateRandomuserDataFaker`/`generateRandomProductData` (Faker-based, preferred) vs. `generateRandomUserData` (array-based, reads `lib/data-factory/registerUserData.json`, legacy). Also home to storage-state file helpers (`prefillStorageStateFile`, `readStorageStateFile`, token refresh helpers) and misc assertions like `assertWithinMargin`.

**Models** (`lib/models/*`, `lib/api-models/*`): plain TS interfaces/types for API request/response shapes and domain objects (`Product`, `CreateUser`, `ProductDetails`, `StorageState`, etc.) — no logic.

**Tests** (`tests/`):
- `tests/E2E/*.spec.ts` — full browser flows (admin panel, checkout, invoices, product catalogue, user account).
- `tests/api/*.spec.ts` — pure API tests via `apiHandler`/`api-models`.
- `tests/auth/*.spec.ts` — login/register UI flows.
- Test titles follow a `TC-<AREA>-<NUMBER>` convention (e.g. `TC-ADMIN-003 - Admin: Create New Product`) with Playwright tag metadata (`{ tag: ['@admin', '@products'] }`) for filtering via `-g`/`--grep`/`--grep-tag`.
- Related API test cases in the same resource often use `test.describe.serial(...)` when a later test depends on state created by an earlier one (e.g. create → get → delete in `product.spec.ts`).

## CI / deployment

`.github/workflows/Build-And-Run-Tests.yaml` runs on push/PR to `main`: builds/pushes a Docker image only if `tests/`, `lib/`, `entrypoint.js`, or the Dockerfile changed, spins up the Toolshop app + MySQL in a fresh GKE namespace per run (`k8s/*.yaml`), runs migrations/seed, applies a Playwright test Job, waits for `/tests/tests_finished.txt`, uploads the HTML report as an artifact, and tears down the namespace. `entrypoint.js` is the container entrypoint: runs `npx playwright test`, posts a pass/fail summary to Slack (`SLACK_WEBHOOK_URL`), then writes the exit code to `/tests/tests_finished.txt`. Other workflow files (`*.yml.ignore`) are disabled/parked. `browserstack.yml` configures cross-browser runs via `browserstack-node-sdk` (not part of the default `npm run` scripts).
