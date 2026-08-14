# Release Log

## v1.4.2

- Date: 2026-07-01
- Trigger: pushed `v1.4.2` tag on `main`
- GitHub Release: published successfully at `https://github.com/halunhaku/marktab/releases/tag/v1.4.2`
- Chrome Web Store: version `1.4.2` submitted successfully and currently marked `待审核`
- Validation:
  - `npm test`
  - `npm run validate`
  - `npm run package`
  - `Release` GitHub Actions workflow completed successfully
- Configured repository secrets:
  - `CWS_CLIENT_ID`
  - `CWS_CLIENT_SECRET`
  - `CWS_ITEM_ID`
  - `CWS_REFRESH_TOKEN`
- Notes:
  - This release validated the automated Chrome Web Store publishing flow end-to-end.
  - Chrome Web Store review remains asynchronous and must be monitored in the Developer Dashboard.
  - Follow-up: update deprecated GitHub Actions dependencies noted during the workflow run (`actions/checkout@v4`, `actions/setup-node@v4`).

## v2.0.0

- Date: 2026-07-03
- Trigger: pushed `v2.0.0` tag on `main`
- GitHub Release: published successfully at `https://github.com/halunhaku/marktab/releases/tag/v2.0.0`
- Validation: `npm test`, `npm run validate`, `npm run package` (all passed)
- Notes:
  - Major redesign: home layout "clock anchor variant" (`a51c3c1`), new popup panel, refreshed screenshots.
  - Chrome Web Store and Edge Add-ons review status not recorded in this repo; confirm in the developer dashboards.

## v2.0.1

- Date: 2026-07-05
- Trigger: pushed `v2.0.1` tag on `main`
- GitHub Release: published successfully at `https://github.com/halunhaku/marktab/releases/tag/v2.0.1`
- Validation: `npm test`, `npm run validate`, `npm run package` (all passed)
- Notes:
  - Chrome Web Store and Edge Add-ons review status not recorded in this repo; confirm in the developer dashboards.

## v2.0.2

- Date: 2026-07-05
- Trigger: pushed `v2.0.2` tag on `main`
- GitHub Release: published successfully at `https://github.com/halunhaku/marktab/releases/tag/v2.0.2`
- Validation: `npm test`, `npm run validate`, `npm run package` (all passed)
- Notes:
  - Chrome Web Store and Edge Add-ons review status not recorded in this repo; confirm in the developer dashboards.

## v2.0.3

- Date: 2026-07-09
- Trigger: pushed `v2.0.3` tag on `main`
- GitHub Release: published successfully at `https://github.com/halunhaku/marktab/releases/tag/v2.0.3`
- Validation: `npm test`, `npm run validate`, `npm run package` (all passed)
- Notes:
  - Chrome Web Store and Edge Add-ons review status not recorded in this repo; confirm in the developer dashboards.

## v2.0.4

- Date: 2026-07-10
- Trigger: pushed `v2.0.4` tag on `main`
- GitHub Release: published successfully at `https://github.com/halunhaku/marktab/releases/tag/v2.0.4`
- Validation: `npm test`, `npm run validate`, `npm run package` (all passed)
- Notes:
  - Chrome Web Store and Edge Add-ons review status not recorded in this repo; confirm in the developer dashboards.

## v2.0.5

- Date: 2026-07-10
- Trigger: pushed `v2.0.5` tag on `main`
- GitHub Release: published successfully at `https://github.com/halunhaku/marktab/releases/tag/v2.0.5`
- Validation: `npm test`, `npm run validate`, `npm run package` (all passed)
- Notes:
  - First release with automated Microsoft Edge Add-ons publishing in the `Release` workflow (`637f2c4`).
  - Chrome Web Store and Edge Add-ons review status not recorded in this repo; confirm in the developer dashboards.

## v2.0.6

- Date: 2026-08-03
- Trigger: pushed `v2.0.6` tag on `main`
- GitHub Release: published successfully at `https://github.com/halunhaku/marktab/releases/tag/v2.0.6`
- Validation: `npm test`, `npm run validate`, `npm run package` (all passed)
- Notes:
  - Workflow gained Edge upload resume support (`4fe6e71`); recovery modes: GitHub-only publish and Edge upload resume via `workflow_dispatch`.
  - Chrome Web Store and Edge Add-ons review status not recorded in this repo; confirm in the developer dashboards.
