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
