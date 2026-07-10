# MarkTab Agent Guide

MarkTab is a Chrome/Edge Manifest V3 new tab extension for browsing, searching, and managing local browser bookmarks. Keep the project small, fast, private, and easy to review for Chrome Web Store submission.

## Product Boundaries

- Preserve the single purpose: a privacy-friendly bookmark dashboard for the new tab page.
- Keep the extension framework-free unless there is a clear maintenance benefit.
- Do not add remote executable code, remote scripts, or external runtime dependencies.
- Do not send bookmark titles, bookmark URLs, folder names, favicon domains, or settings data to developer-owned services.
- If web search behavior changes, make the data flow explicit because submitted search terms go to the selected search engine.

## Extension Rules

- Maintain Manifest V3 compatibility.
- Keep permissions minimal. Current permissions are `bookmarks`, `favicon`, `search`, `storage`, and `activeTab`.
- Document every new permission in `README.md`, `PRIVACY_POLICY.md`, and `CHROME_STORE_SUBMISSION.md`.
- Use `activeTab` only for user-triggered popup actions, especially adding the current page as a bookmark.
- Keep scripts in external `.js` files. Do not add inline script blocks or inline event handlers.
- Package only runtime extension files: manifest, HTML, CSS, JS, and icons.

## UI Expectations

- The new tab page should load quickly and stay useful with many bookmarks.
- Preserve keyboard flows: `Ctrl/Cmd + K` focuses search and `Esc` clears search or closes panels.
- Keep empty, loading, no-result, and error states compact and understandable.
- Icon-only buttons need accessible labels or titles.
- Any visibility-setting feature must offer a way to recover hidden folders or settings.

## Visual Language

MarkTab uses the HALUNHAKU **Mist Blue productivity variant** (see `./DESIGN_SYSTEM.md`):

- Use one blue accent family: `#5b6cff` / `#4f7cff` in light mode and `#7aa2ff` in dark mode. Do not add an accent-color selector or a second accent family.
- Use serif headings (`Noto Serif SC`), sans body text, and mono dates, numbers, and clock values.
- Use cool gray backgrounds, translucent white/slate surfaces, 18-32px radii, subtle cool borders, and restrained blue-gray shadows.
- Glass blur is limited to the fixed sidebar panel and search overlay. Other cards and controls may be translucent but must not add `backdrop-filter`.
- Decorative gradients are limited to the low-contrast ambient page background, brand/icon surfaces, and popup primary treatment. Do not add rainbow, high-contrast, or text gradients.
- Keep responsive behavior aligned with the runtime contract: fixed sidebar above `1200px`; drawer navigation at `1200px` and below; compact mobile layout at `768px` and below.

## Privacy And Store Review

- Keep privacy claims aligned across code, README, privacy policy, and store submission notes.
- Before release, run `npm run validate` and `npm run package`.
- Before uploading, load the unpacked extension from this folder and test new tab, search, hidden folder recovery, theme changes, popup stats, and adding the current page.
