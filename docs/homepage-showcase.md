# Public homepage showcase

## Scope and source of truth

The platform uses plain HTML/CSS/JavaScript views compiled into a Vercel Node function. Supabase handles authentication, PostgreSQL and private media storage. Existing page routes, API routes, signup/login, navigation and member views are unchanged.

`web/homepage.js` replaces only `renderLanding` after the existing production functions are installed. `web/homepage.css` scopes every presentation rule to `.home-*` / `.home-page`; it does not restyle member screens. `scripts/build.mjs` includes these files before startup. The shared document title/description now describe the platform's positioning.

## Feature accuracy

| Presentation | Existing implementation | Limit |
| --- | --- | --- |
| Show your work | Profile roles, category, bio, original-media links, public work history, awards | Social analytics require supported provider authorisation; no invented metrics appear in previews. |
| Find your people | Discover search, role/location/work-type filters, member cards, following | Real results depend on members creating profiles. |
| Get credited | Work contributors, attribution, invitations and confirmed credits | Pending credits require confirmation; attribution does not transfer copyright. |
| Make moves | Briefs, gig bids, booking requests and project/team invitations | Preview shows the existing project team interface, not an invented active job listing. No jobs or income are guaranteed. |
| Handle business | Office tasks, documents, assets, invoices, bookings, private messages and team permissions | Invoice records do not process payments. File limits and external link permissions still apply. |
| Build your support | Following, saving, reposting, appreciation, fan contributions and check-ins | No paid fan subscriptions, tipping or exclusive-content access is promised. Those features are not implemented. |

Existing automated tests exercise data persistence, scope/ownership checks, private financial information, invitations, storage and account behavior using isolated PostgreSQL and mocked Supabase responses. Live SMTP, storage and hosting configuration cannot be inferred from those tests.

## Screenshot provenance

All assets in `public/homepage/` were captured in Chromium from the current compiled application. The original `baseDemo()` data was used only inside an isolated local test browser, with no live Supabase credentials. The real renderers were used: `renderApp`, profile history, `renderDiscover`, `openWork`, `projectOffice` (tasks/team) and the fan-contribution feed. The local fixture was set up, then demo mode was disabled before capture. No demo route or sample data was enabled for users.

Names and work are fictional: Sam Ndlovu, Maya Dube, Alex M, The Listening Room and After hours. The fixture has no contact information, tokens, real member photos, bank details or audience metrics. Work reaction counts were zeroed. Project task data is illustrative; three example tasks exercise the existing status controls. Screenshots show tasks/team rather than financial totals. The homepage labels previews as actual interfaces with illustrative sample content. Screenshot controls are static images; only the surrounding view switcher is interactive.

Desktop captures: Office workspace, task close-up, profile, Discover, work credits, project team and fan contributions. Mobile captures use the same views at 390px rather than shrinking desktop screens. Credits use the real dialog width. Assets are local WebP images encoded at quality 88. They are served from Vercel's `public` output; no additional image host, dependency, database seed or screenshot API is needed.

Images reserve their dimensions, below-fold views load lazily, and the main hero screenshot has high fetch priority. The desktop screenshot asset total and mobile asset total should each remain under 512 KB. The theme toggle retains the existing behavior; screenshot frames always represent the real dark interface.

## Review checklist

Run `npm ci`, `npm run build`, `npm test`. There is no configured lint or type-check command. On a Vercel Preview:

- Verify static `/homepage/*.webp` files load and the public homepage has no console errors.
- Check desktop, tablet and narrow mobile layouts, including the theme toggle and reduced-motion setting.
- Use Profile / Discover / Workspace / Opportunities tabs with mouse, touch and keyboard (arrows, Home, End). They switch previews without fetching member data or navigating away.
- Check all Tap In links go to `/signup`, the fan link retains `kind=fan`, Explore scrolls to `#platform`, and existing Feed/Discover/Login links still work.
- Confirm signup, password login/reset and member dashboards remain intact. Two-account privacy tests should remain green.
- The homepage still uses the platform's existing startup/bootstrap. Its existing dependence on runtime configuration has not been changed. A provider/database failure is not hidden with fake content.

No production deployment or new live member data is created by this branch. Validate the Vercel Preview before merging.
