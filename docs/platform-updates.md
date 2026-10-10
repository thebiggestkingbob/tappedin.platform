# Platform discovery, sharing and collaboration

This change keeps the existing Vercel/Supabase architecture, branding, account flows, database tables and member workspaces. No new dependency, service, secret or database migration is required.

## Member experience

- **Roles:** Web designer and Graphic designer sit under Production & Crew. Web design and Graphic design are available as work types in onboarding, work posts and opportunities. Profile role editing keeps the existing category accordions and adds a search field, selected-role count and clear selectable chips.
- **Feed:** Tap In + opens the existing menu for work, briefs, collaborations, appreciations and check-ins. The redundant shortcut buttons and filter dropdowns are removed. For you, Following, Your reposts and Saved remain, using the same chip treatment as Discovery, profile and Office tabs. Each post has Share post and View link controls. Shared links work without an account and offer TAP IN.
- **Discovery:** One page searches talent and opportunities. All, Talent, Briefs & Gigs, Collabs, Applied and Your posts are chips. Search matches every entered word across public names, handles, public business contact details, categories, roles, biographies, locations, work types, linked work, awards, opportunity descriptions, requirements and dates. It never indexes private messages, earnings or banking details. Existing `#opportunities` links still open the discovery page's Briefs & Gigs view. Posting briefs and inviting people remain available.
- **Office:** Tabs are ordered Inbox, Bookings, Teams, Projects; existing fan accounts continue without industry booking tools. Notifications show real invitations, booking/application status, unread messages, workspace versions and team conversation activity. Mark updates read persists to the member's account. Award invitations require an explicit response. Project invitations open the existing acceptance interface before protected workspace data is available.
- **Profile:** The avatar sits beside the name; main category and location appear together below it. Roles follow, then the red biography and email/telephone icons. Follow, Message, Book, social activity, private gig records and rate cards remain. Tap In+ opens an editable collaboration draft containing the other person as an invited participant; publishing uses the existing invitation/acceptance flow. A draft is never published just by clicking the CTA.
- **Awards:** A dedicated tab contains the member's awards and accepted shared awards. An owner can tag registered people; recipients get an Office invitation and accept or decline. Accepted awards appear on both profiles. Shared recognition references the original award rather than copying into the recipient's editable profile. Removing an award or tag also removes its shared appearance. Claims remain member-provided, not independently verified.
- **Venues:** Work posts and check-ins can create an unregistered venue contact without losing the post draft. Publishing offers the existing personal invitation link for email/WhatsApp. The venue name appears on the post immediately. The venue links to a registered profile only after signup and acceptance; adding a contact never creates a fake account.
- **Right rail:** An opportunities snapshot follows The People Behind It, showing up to three currently open briefs/collaborations and a link to Discovery.

## Public sharing and thumbnails

`/post/:id` renders work, opportunity and contribution posts with public copy, original links, confirmed/unconfirmed credits, social metadata and TAP IN links. Missing/deleted posts return 404. Private earnings, applications, invites, Office files and banking data are not included.

YouTube links use their standard thumbnail URLs. Other posted work links use publicly available Open Graph/Twitter image metadata. The first three sources are checked; failures leave the original title/link intact. Requests have byte, timeout, redirect and cache limits. They use HTTPS with certificate verification, no cookies or authorization, and pinned public IPv4 DNS results to reject internal/private addresses. Returned metadata images are checked for public addresses. Preview images load directly from the source CDN.

Some providers, particularly private or login-gated social posts, block automated access or omit preview metadata. Those posts can still be shared and viewed, but an image cannot be guaranteed. Social networks decide how and when to cache link previews. Vercel deployments need outbound HTTPS/DNS access to the posted sources. No preview API key is needed.

## Files

`web/platform.js` and `web/platform.css` contain the isolated UI changes. Existing composers and domain lists receive small updates in `web/app.html`, `web/upgrade.js`, `web/community.js`, `web/categories.json` and `worker/domain.mjs`. `worker/platform.mjs` implements public post pages, scoped notifications and award tags. `server/link-preview.mjs` fetches thumbnails, supplied to the worker by `server/handler.mjs`. `scripts/build.mjs` includes these files. Regression coverage is in `tests/platform-updates.test.mjs`.

## Validation and deployment

From the repository root:

```sh
npm ci
npm run build
npm test
```

In the managed cloud workspace, use `npm ci --cache /tmp/tappedin-npm-cache` if the default cache is unwritable. Existing Node tests use PGlite, mocked Auth and database adapters; they do not require or change the live Supabase database. The existing Vercel settings and environment variables in the main README stay the same. Review the branch preview, then merge into the existing production branch for Vercel to deploy.

Browser checks should cover desktop/tablet/mobile feed and Discovery, role search/save, profile collaboration publishing, award invitation acceptance from a second member, missing venue creation with draft preservation, notifications and anonymous public post links. Use test accounts rather than real member information.

## Limits

Search currently runs over the public bootstrap data in the browser. It does not add a search service or a private-data index; pagination/server search may be needed as membership grows. Office notifications refresh on account load and when the panel is opened; this is not push/email notification delivery. Existing industry restrictions on posting work/opportunities and bookings remain; fan accounts can still acknowledge work and check in. Venue invitations are personal links, not automatic email dispatch. Thumbnail delivery and real live account/email behavior must be checked in the Vercel preview with the configured production services.

## Verified in this change

Frozen installation and the production build passed. The complete Node suite passed (62 tests). A local Chromium/PGlite smoke run covered all the member flows listed above, including both work-post and check-in venue invitations, at 1440, 1024, 768, 390 and 320 pixels. No page JavaScript errors or horizontal overflow were observed. Auth and third-party thumbnail delivery used safe test fixtures/mocks; live Supabase email delivery and external-site metadata retrieval were not verified here. The project has no configured lint or type-check commands.
