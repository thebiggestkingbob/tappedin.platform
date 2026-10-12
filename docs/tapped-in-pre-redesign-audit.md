# TAPPED IN presentation audit

Baseline: `10395595f0c553c8c86d9fecf13617bbfd64aa3e`. Production project: `tappedin.platform`, `prj_0lD7SRl11zLLjYc7h6FxD4aKf4gz`, team `team_v8zAj6GZvTNVlH2l3yObf0dc`, https://tappedinplatform.vercel.app/.

## Preservation matrix

| Area | Source | Preservation approach |
| --- | --- | --- |
| Public copy, homepage sections, links, preview images | web/homepage.js, web/upgrade.js, public/homepage | Keep markup, text and assets; restyle existing sections |
| Feed, discovery, opportunities, profiles, activity calendar | web/app.html, web/platform.js, web/upgrade.js | Keep renderers, search, filters, reactions and navigation |
| Office, projects, messages, invoices, rate cards, contributions | web/community.js, web/community.css | Keep actions, state and content; shared surface and form styles |
| Industry members, fans, delegated agents, project members | worker/index.mjs, worker/platform.mjs, worker/community.mjs | No permission or business logic edits |
| Login, signup, recovery, verification, onboarding | web/production.js, web/upgrade.js, server/supabase.mjs | Keep auth handlers and fields; change only absent-preference theme default |
| Notifications, account settings, bookings | Existing application renderers | Shared cards, navigation, typography, controls |
| API, sessions, persistence, uploads | api, server, worker, supabase | No changes or live writes |
| Branding | Existing brand renderer and favicon | Preserve assets; effective CSS brand accent is #a41627 |

## Routes and dependencies

Public and account routes include /, /feed, /app, /join, /login, /signup; claim, invite, rate-card, stakeholder and post share routes use existing identifiers. Hash navigation exposes discovery, opportunities, profiles, settings and Office desks. Media, Office media, authentication and /api/v3 endpoints remain untouched. /demo must remain 404. No separate admin dashboard was found in this repository; none will be invented.

Vercel serves the generated HTML and APIs through api/platform.mjs. Build combines app.html with four stylesheets and existing JavaScript renderers. Supabase Auth, PostgreSQL and private Storage remain server dependencies. Tests use isolated PGlite, not production data.

## Visual findings

The current default is dark. Later community styles erase most card borders and backgrounds and force secondary text to full contrast. Effective accent #a41627 overrides older #9c1823; inconsistent #c42a36 and #dc4250 are presentation variants. Restore a coherent surface hierarchy and use the effective accent throughout new styles. Preserve a user-selected dark theme and its switch.

## Implementation plan

1. Capture baseline local public screenshots and execute existing regression tests.
2. Add a final shared presentation stylesheet to the existing build, with white foundation, black text, opacity-derived neutrals and #a41627 accents.
3. Restyle existing public sections, shared navigation, feeds, cards, messaging, forms, profiles and Office using existing classes.
4. Make light the default only when there is no stored preference; retain theme switching.
5. Validate build, tests, copy/handler preservation and browser layouts at 1440, 1280, 1024, 768, 430, 390 and 360 pixels. Capture before/after images.
6. Deploy changed source files to the verified existing production project and inspect readiness and live public responses.

The supplied Behance URL returned 403 through the browsing tool. Direct visual reference inspection is unverified; use the design principles explicitly provided in the brief. Live authenticated workflows require test accounts; report anything not exercised as unverified.
