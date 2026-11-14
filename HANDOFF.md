# Handoff — Personal GAS CMS

## Current project

Repository: [`Liordanc/google-app-script-as-cms`](https://github.com/Liordanc/google-app-script-as-cms), default branch `master`.

This is a personal CMS project based on Google Apps Script, Google Sheets, Google Docs, and a web frontend. The user prefers Hebrew, concise guidance, and concrete changes in the repository. Treat this as a personal, single-owner project for the MVP; avoid adding multi-user roles and approval workflows unless requested.

## Product direction

- Google Sheets stores content metadata and workflow state.
- Google Docs stores the editorial body; records reference Docs using `docId`.
- GAS is the server/API layer.
- Public reads must return published content only.
- Admin writes require server-side authorization.
- Explicit Preview/Publish/Unpublish actions; do not auto-publish on document edits.

## Planning documents already in the repository

- [`PLAN-ARCHITECTURE.md`](PLAN-ARCHITECTURE.md) — architecture and phased plan.
- [`MVP-PLAN.md`](MVP-PLAN.md) — personal CMS MVP scope and acceptance criteria.
- [`TODO.md`](TODO.md) — implementation checklist.
- [`CMS-COMPONENTS.json`](CMS-COMPONENTS.json) and [`CMS-COMPONENTS.md`](CMS-COMPONENTS.md) — planned system components.
- [`CMS-EXAMPLE.md`](CMS-EXAMPLE.md) — end-to-end architecture example.
- [`CMS-DESIGN.md`](CMS-DESIGN.md) and [`DESIGN-README.md`](DESIGN-README.md) — CMS visual system direction and references.
- [`LEARNING-COMPONENTS.md`](LEARNING-COMPONENTS.md) — learning component notes for Excel/Gmail.

## UI/design status

- [`front-end/design-system.html`](front-end/design-system.html) is a static CMS UI/design showcase. It is not connected to GAS, Sheets, or Docs.
- [`front-end/learning-components.html`](front-end/learning-components.html) is a static, Figma-inspired demo for Excel and Gmail learning interactions. It is not a full guide or connected to external services.
- User clarified the next desired design deliverable: **one component catalog only**, organized from smallest to largest (tokens/atoms/molecules/organisms/content blocks), not full sample guide pages.
- A proposed file, `front-end/component-library.html`, was prepared in a write that awaited confirmation. The current repository tree does **not** show that file. Check for it before recreating; if absent, add it and verify it appears in the repository. The intended content is a component catalog only, with typography, colors, buttons, fields, alerts, media, tables, lists, quote, code, progress, quiz, simulator shell, lesson header, and navigation shell.
- The user asked if a new conversation is needed after a “Message too large” error. It is optional; a new conversation can use this handoff. The error likely came from sending a very long message with code/references, not from GitHub.

## Backend status — important: do not assume the CMS API is implemented

The repository is a legacy starter with a public demo/contact form. The previous planned broad CMS backend patch was left awaiting confirmation and was not committed as a complete implementation.

Files that were committed earlier:
- `back-end-script/CheckAuthorization.gs` was changed to add `isCmsAdmin_()` using `CMS_OWNER_EMAIL`; review deployment assumptions before relying on it.
- `back-end-script/PostDataToSheet.gs` now lazily opens the contact submissions spreadsheet.
- The root `Config.gs`, `Routes.gs`, and `GetDataFromSheet.gs` may still be legacy versions; inspect their current contents and commit history before editing.

Security concerns identified:
- Earlier source contained an API key in frontend code and hard-coded example configuration. Never put secrets in frontend code.
- A static API key sent by a browser is not secure for admin writes.
- Configure a restricted admin deployment and verify GAS user identity behavior. Keep public read endpoints separate from privileged writes.
- Do not expose draft content or raw Docs IDs unnecessarily.

## Recommended next actions

1. Inspect latest `master` tree and the actual `front-end/component-library.html` existence.
2. If absent, implement only the requested atomic component catalog; do not add sample guide pages or connect backend unless asked.
3. Keep the Figma-inspired look: monochrome frame, restrained pastel section surfaces, rounded pill text buttons, circular icon controls, generous spacing, no heavy shadows; use generic fonts, not proprietary Figma assets.
4. Verify HTML structure/JavaScript basics and responsive behavior; clearly label all examples as static demos.
5. Then, if the user wants functional CMS work, first inspect current backend files and implement the MVP in small, reviewable changes. Do not copy previously suggested code blindly: it used fragile hard-coded column indexes and a browser-visible API key approach.

## Communication notes

- Respond in Hebrew.
- Be concise and explicit about what is implemented versus planned/static.
- When a GitHub write is pending confirmation, state exactly which file/change is waiting; do not claim it was committed until the tool confirms success.
