# Microsoft Edge Add-ons submission

MarkTab uses the official Microsoft Edge Add-ons Update REST API v1.1 to update an existing extension.

## GitHub Actions secrets

Configure these repository secrets under **Settings → Secrets and variables → Actions**:

- `EDGE_PRODUCT_ID`: Product ID from Partner Center.
- `EDGE_CLIENT_ID`: Client ID from **Microsoft Edge → Publish API**.
- `EDGE_API_KEY`: current API key from the same page.

Never commit or paste these values into logs, issues, pull requests, or chat. API keys expire; rotate `EDGE_API_KEY` before its Partner Center expiry date.

## Release behavior

A `vX.Y.Z` tag packages one deterministic ZIP for Chrome and Edge. The workflow uploads it to Edge Add-ons, waits for package validation, submits the draft, and waits for the API to accept the review submission. Store certification remains asynchronous.

The Update REST API only updates an existing product. Initial creation and listing metadata changes remain manual in Partner Center.

## Retry and recovery

Run **Actions → Release → Run workflow** with the existing tag to retry a failed submission. Check both dashboards first: if Chrome accepted but Edge failed, a full retry can attempt the Chrome submission again.

If Edge accepted the upload with `HTTP 202` but the workflow stopped while its operation was still `InProgress`, run the workflow from `main` with the existing tag and set `resume_edge_upload_operation_id` to the returned operation ID. This resumes polling, submits the Edge review after validation, and does not resubmit Chrome or upload the package again.

Use `publish_github_release_only` only when an existing GitHub Release is still a draft and both Chrome Web Store and Edge Add-ons have accepted their review submissions. This mode skips both store APIs.

Official documentation: <https://learn.microsoft.com/en-us/microsoft-edge/extensions/update/api/using-addons-api>
