# Copilot Instructions

## What this repo does

This repo holds configuration for [nav-dekoratoren](https://github.com/navikt/nav-dekoratoren) — the common header/footer decorator used across nav.no. Currently it manages **Task Analytics (TA) survey configuration**, which is deployed as a Kubernetes ConfigMap to NAIS.

## Commands

```bash
pnpm install --frozen-lockfile   # install dependencies
pnpm run validate-dev            # validate configs/dev/ta-config.json against schema
pnpm run validate-prod           # validate configs/prod/ta-config.json against schema
```

There is no test suite beyond the two validate scripts above.

## Architecture

- `configs/{dev,prod}/ta-config.json` — the actual config files edited by contributors
- `schemas/ta-config.schema.json` — JSON Schema (draft-07) that both config files are validated against
- `validate-configs.js` — Node script that runs validation; used by both the npm scripts and CI
- `.nais/config.yml` — NAIS ConfigMap template; the placeholder `{{TA_CONFIG}}` is replaced by the JSON content during deploy
- `.github/actions/build-and-deploy/` — composite action that validates, injects JSON into the NAIS template, then deploys via `nais/deploy`

**Deploy flow:**
1. PR → CI runs `validate-dev` and `validate-prod` on all branches
2. Merge to `main` → `deploy-prod.yml` deploys prod config and creates a timestamped GitHub release
3. Changes to `configs/dev/**` on `main` also trigger `deploy-dev.yml`; dev can also be triggered manually via `workflow_dispatch`

Changes are live in the decorator within ~1 minute of deploy.

## ta-config.json schema

Each entry in the array requires only `id` (Task Analytics survey ID). All other fields are optional:

| Field | Type | Notes |
|---|---|---|
| `id` | string | Required. Survey ID from Task Analytics. |
| `selection` | number 0–100 | % of visitors shown the survey. Default: 100. |
| `duration.start` / `duration.end` | datetime string | Norwegian timezone. Exclusive with ms precision. |
| `urls[].url` | string | URL to include/exclude. |
| `urls[].match` | `"exact"` \| `"startsWith"` | Required when `urls` is set. |
| `urls[].exclude` | boolean | Default false. If all URLs have `exclude: true`, the survey shows everywhere *except* those URLs. |
| `audience` | `"privatperson"` \| `"arbeidsgiver"` \| `"samarbeidspartner"` | Default: all audiences. |
| `language` | `"nb"` \| `"nn"` \| `"en"` \| `"se"` \| `"uk"` \| `"ru"` \| `"pl"` | Default: all languages. |

Surveys are **never** shown on pages using the simple header.

**Selection sampling:** When total `selection` sum < 100, the remainder is the probability of showing no survey. When sum > 100, selections become relative weights. A shown/drawn survey is suppressed for that user for 30 days (cookie-based).

## Key conventions

- **Prod URLs** use `https://www.nav.no/…`; **dev URLs** use `https://www.dev.nav.no/…`
- `duration` strings must be parseable by JavaScript's `Date.parse()` — ISO 8601 format recommended (e.g. `"2024-06-01T08:00"`)
- Validate locally before pushing: a failed validation in CI blocks deploy
- Use `pnpm` (not npm/yarn); the package manager version is pinned in `package.json`
