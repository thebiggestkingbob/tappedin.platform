# Connected TAPPED IN product update

## Implemented experience

- Mobile application navigation uses icons only, with an accessible, centered red Tap In control. Desktop retains the left-panel action. Feed-level Tap In controls are removed. Office shows a persistent notification indicator; activity refreshes every 20 seconds while the page is visible.
- Work and contribution cards have one large heading over their image, a full bottom fade, grouped star/save/share actions and retained repost support. Clicking the card or its heading opens the details. The old View link and Behind the work actions are removed from feed cards.
- Work, brief/collaboration and fan-contribution composers allow one owned JPG, PNG or WebP image under 5 MB, with landscape or square crop. Work and contributions can use future dates. Optional project/team tags require accepted workspace membership and publish the tagged name, never workspace contents.
- Work calendars follow work history. Every date is actionable; month navigation, Today and a custom date input are supported. Visitors can initiate work with a member; their credit remains pending until they accept. Moments become dated calendar stars. Legacy moments are preserved and can be placed on the calendar.
- Calendar data includes the signed-in member’s project schedules and task deadlines privately. Owners can explicitly publish a project’s title/date; task details, files, fees and messages are never returned by the public calendar API.
- Profiles support up to ten owned-post highlights. Total Fees recorded replaces the Social profiles statistic. Individual fees stay private. The total remains private by default, with explicit public opt-in in Settings. The lower-left profile control shows full name, main category and location.
- Discovery offers compact grid/list cards with picture, name, categories, location and follow. People/role/project selectors have search inputs. City/town fields suggest named cities and countries; additional places can be entered as `Town, Country` without a third-party lookup dependency.
- A Person or Business / company identity can be selected at onboarding and profile editing. A post belongs to its signed-in profile; people and companies can be credited/tagged together and confirm their contributions independently. One profile does not silently impersonate another business.
- Office contains Projects, Teams, Bookings, Inbox and Contacts. Legacy inbox/booking navigation opens those Office desks. The inbox has one conversation/request stream, without message/invitation/application tabs or zero counters.
- Contacts support add/edit/delete/search, personal invitations and syncing public information from an accepted linked profile. Contact notes stay private. Linking requires the invited member’s consent.
- Tasks can be opened, edited, reassigned and removed. Owners can reassign; the owner or current assignee can edit/delete. Project versions prevent stale saves.
- Budget proposals use descriptions, quantities and rates. Totals are calculated and validated on the server; accepted items appear in the approved budget and final approval remains restricted to the owner or a permitted agent. Existing invoice line items remain supported.
- Settings provides a password change form. The server checks same-origin requests, verifies the current session, reauthenticates the same user with their current password and then updates through Supabase Auth. Tokens remain server-side / HttpOnly.
- Any registered person or company can accept an agent invitation regardless of role. Scopes are explicit, access starts after acceptance, new scope increases require fresh acceptance, and revocation immediately blocks access. Existing accepted grants remain compatible.
- Public website now explains representation permissions and lists every existing role family, plus fans. The existing black/white/brand-red identity remains.
- Share opens link/copy controls and a complete public-card PNG exporter with white/black background. The export includes full title, description, image, credits/tags, source links, public budget where applicable, reactions and permalink. Native image sharing is supported when the browser permits it; otherwise download plus copy/link is available.

## Engineering and verification

Changes use existing JSON entities, private state, storage and optimistic versions. No database tables, schema migrations, production data fixtures, service credentials or production dependencies are added.

`npm run build` passes and checks the compiled client syntax. All 76 Node regression cases across nine test files pass. Eleven new cases cover identity/location, upload ownership/content, future work, highlights/fee privacy, contacts, tasks, budget approval, calendar privacy, agent consent/revocation, project tags and password reauthentication. Existing agent tests were updated to exercise the new consent workflow while retaining their access/revocation assertions. `git diff --check` passes. This repository has no lint or type-check script.

Local Chromium verification uses the real application handler, an isolated PGlite database and clearly named local review accounts. No local review data is written to production. Thirty-five layout checks cover feed, discovery, profile, unified inbox and Office at 1440, 1280, 1024, 768, 430, 390 and 360px with no horizontal overflow or page JavaScript errors. Browser flows exercise snapshots, future image-only work, highlight persistence, contacts, task editing, budget proposals, password submission, non-Agent representation acceptance, calendar stars, city/country profile saving and brief images. Screenshots and exact results are in `docs/experience-review/`.

## Practical limits

- Local Auth provider calls are fixtures. The live Supabase password update, real account recovery/delivery and storage credentials still require production acceptance checks with a real account.
- Notification refresh is periodic, not a Realtime subscription or a push notification service.
- Contact sync copies the linked member’s public profile on request; it does not import a phone address book or external CRM.
- The place directory supplies common cities/towns across multiple countries, with manual country-qualified entry for additional places. It is not a live geocoder.
- External preview images that prohibit cross-origin export cannot be included in a PNG. The exporter reports this and includes all public text/credits/links; uploaded TAPPED IN images are supported.
- Each person/company uses its own existing profile. Shared representation uses permissioned agent access; multi-profile switching under one login is not introduced.
- Production runtime access/logging may be restricted by the connected hosting account; deployment readiness and any runtime observations are reported separately.
