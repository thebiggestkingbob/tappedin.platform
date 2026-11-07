# TAPPED IN — Feature relationship audit (2026-11-07)

Status: **code/documentation review, not live acceptance testing**. No production data, database, or deployment changed.

## Product principle
TAPPED IN should connect identity → discovery/public activity → professional intent → agreement → execution → financial records → reputation, while allowing non-commercial social/fan activity to remain social. Avoid duplicating work or silently changing a record's meaning.

## Current implemented/documented surfaces

| Domain | Existing surface | Evidence |
|---|---|---|
| Identity | Supabase password authentication, member profiles, categories and roles | `README.md`, `docs/platform-updates.md` |
| Social | Feed, reposts, saved posts, appreciations, sharing and public post URLs | `docs/platform-updates.md`, `web/platform.js` |
| Discovery | Combined talent, briefs, gigs, collaborations, applied and own posts | `docs/platform-updates.md` |
| Opportunities | Briefs, bids/applications, invitations | `README.md`, `worker/index.mjs` |
| Business initiation | Profile Book CTA, booking requests, public rate cards | `docs/platform-updates.md`, `web/community.js` |
| Office | Inbox, Bookings, Teams, Projects; tasks, messages, documents, assets, invoices | `web/experience.js`, `web/community.js`, `worker/community.mjs` |
| Delegation | Scoped agent permissions, invitations | `README.md`, `web/experience.js` |
| Attribution | Contributor credits, award invitations/acceptance | `docs/platform-updates.md` |
| Fan | Following, contributions and check-ins | `docs/homepage-showcase.md` |
| Infrastructure | Supabase Auth/Postgres/Storage; Vercel Node backend | `README.md`, `scripts/build.mjs` |

## Confirmed code-level gaps / important limitations

**C1 — No dedicated structured negotiation workflow found in the inspected application modules.** Text search of `web/community.js`, `web/platform.js`, `worker/index.mjs` and `worker/community.mjs` yielded no `negotiat*` implementation. Messages, bids, booking requests and invoices exist, but a first-class offer/counteroffer/acceptance contract is not evidenced. This is an *absence in inspected modules*, not proof no other implementation exists. Audit the remaining UI and handlers before implementing.

**C2 — Invoice status is manually editable by the project owner, not verified payment settlement.** `worker/community.mjs` accepts owner-only `invoicestatus` updates including `Paid`. `README.md` and `docs/homepage-showcase.md` explicitly state no billing/payment processing. The invoices tab already warns that status does not collect or transfer money; preserve this. The printable invoice view shows `Paid` without that qualification, so review clearer payment provenance on printed/exported invoices. Do not imply verified settlement.

**C3 — Discovery search is client-side over public bootstrap data.** `docs/platform-updates.md` confirms this, with server search/pagination a future scaling need. This can produce incomplete results as membership grows.

**C4 — Office notifications are refresh-based, not push delivery.** `docs/platform-updates.md` says refresh on account load/panel open, no push/email notification delivery. Do not promise instantaneous notification.

**C5 — Live external verification remains outstanding.** `README.md` and docs distinguish mocked local tests from actual SMTP, Auth, Storage and Vercel validation. Tests passing do not establish end-to-end production correctness.

## Relationships requiring traced validation

| ID | From → To | Desired invariant | Current confidence | Test |
|---|---|---|---|---|
| R1 | Profile → Discover | Roles, availability, location and public details reflect saved profile | documented, not live-tested | Edit role, search from second account |
| R2 | Feed opportunity → Discover | One opportunity ID, identical status/deadline everywhere | partially documented | Publish/edit/close; compare both views |
| R3 | Application/bid → decision → Office | Acceptance yields an explicit, permissioned project/work record; no duplicate data | **unverified** | Apply, accept, inspect both users' Office |
| R4 | Profile booking → Office bookings | Request, response and status synchronized for both parties | **unverified** | Book as A, accept/decline as B |
| R5 | Conversation → negotiation → agreement | Offer revisions and final acceptance are immutable, attributable and visible to both parties | **missing dedicated workflow in inspected modules** | Two-account counteroffer/acceptance |
| R6 | Agreement → project/tasks | Scope, dates, fee, participants and terms carried forward | **unverified** | Accept agreement, inspect project creation |
| R7 | Project → invoice | Invoice references project and agreed milestones/fees; owner can issue; client can view | partial: project invoices exist | Create, issue, inspect permissions |
| R8 | Invoice → payment | Never equate manual `Paid` status with processed money | **confirmed limitation** | Inspect invoice labels and records |
| R9 | Agent delegation → booking/inbox | Agent acts only within delegated scope; attribution preserved | documented, not live-tested | Grant/revoke then retest |
| R10 | Invitations → notifications → access | Pending invites do not reveal protected project data | documented, not live-tested | Invite, inspect before/after accept |
| R11 | Credit/award → profiles | Accepted attribution references one source, removal propagates | documented, not live-tested | Tag, accept, remove |
| R12 | Fan contribution → Office/financials | Social contributions must not imply a monetary transfer | documented non-payment limitation | Create contribution, inspect financial views |

## Proposed canonical model (design, not yet implemented)

- **Identity**: member, public profile, role/category, organization/team, delegated permission.
- **Intent**: opportunity, application, booking request, conversation. Each has an owner and counterpart.
- **Agreement**: immutable accepted revision of structured terms (scope, schedule, fee/currency, deliverables, participants), with audit trail and explicit consent by required parties.
- **Execution**: project/workspace references agreement and source opportunity/booking; task and asset records attach to project.
- **Finance**: invoice references project/agreement and optionally milestones; invoice status distinct from payment transaction status. Never claim payment processing without a verified provider transaction.
- **Activity**: notifications reference the originating entity/event, not free-floating duplicated strings.

Potential state transitions:
- Opportunity: draft → open → closed/cancelled.
- Application: submitted → shortlisted → accepted/rejected/withdrawn.
- Booking: requested → accepted/declined/cancelled → completed.
- Offer: draft → proposed → countered → accepted/declined/expired.
- Work: pending → active → completed/cancelled.
- Invoice: draft → issued → paid-recorded/cancelled (until payment integration exists).

Transitions require role/ownership checks, server-side validation, idempotency and explicit audit timestamps. These are proposals for review; do not migrate live data on assumptions.

## Priority and execution plan

**P0: Truth and safety**
1. Audit invoice labels and separate manually recorded payment status from actual settlement.
2. Two-account tests for private files, earnings, invoices, agent delegation and pending invitations.
3. Verify production Auth/email/storage independently of mocked test suite.

**P1: Connect the core work loop**
4. Trace application acceptance and booking acceptance into Office; implement a single authoritative work record only after schema and user journey review.
5. Design and approve a structured negotiation state machine and its permissions before code changes.
6. Define how messages reference offers, bookings, opportunities and projects.

**P2: Consistency and growth**
7. Centralize status display/notifications across Feed, Discover, Profile and Office.
8. Add paginated server-side discovery when data volume warrants it.
9. Validate fan/community and professional workflows separately across role types.

## Acceptance scenarios

- **Artist hires designer**: finds designer, opens conversation, negotiates deliverables and fee, both accept, Office project created once, task assigned, invoice tied to same agreement.
- **Agency responds to brief**: posts application, owner accepts, both users see one project and consistent opportunity/application status.
- **Agent represents artist**: owner grants scoped access, agent replies or manages bookings as permitted, owner revokes access, further actions denied.
- **Fan follows artist**: follows, appreciates and contributes without being presented with industry booking tools or fake monetary settlement.
- **Cross-account privacy**: a third account cannot access unrelated messages, invoices, private project assets or financial records.

## Guardrails
No changes to production, no destructive migrations, no invented payments or verified social metrics, no automatic publishing of drafts, and no new role privileges without explicit approval. Implement incrementally on review branches with tests and preview validation.

## Detailed source trace — second pass (2026-11-07)

**Finding T1 — Accepted opportunity application does not create an Office project.** In `worker/index.mjs`, the `applications` update branch accepts/declines an application and, on acceptance, appends a member to the opportunity's `team`. There is no Office project creation in this branch. The separate `POST /api/v3/office` route in `worker/community.mjs` creates a project and optionally links a post or opportunity, but does not take an accepted application as its source. **Confirmed disconnected handoff**: acceptance and project creation are separate actions. Design question: should accepting an application offer to create a project, or automatically create one only after explicit scope/budget confirmation?

**Finding T2 — Booking acceptance does not create an Office project.** In `worker/index.mjs`, `requests` is stored as a booking entity and changes status between Requested, Accepted, Declined, Completed or Cancelled. The update does not create a project, invoice or conversation link. **Confirmed missing automatic handoff**, but automatic project creation may not be appropriate for every booking. Distinguish simple appearance bookings from multi-deliverable projects.

**Finding T3 — Project proposals exist, but they are not bilateral deal negotiations.** In `worker/community.mjs`, `proposal` adds a pending budget/scope approval to an existing project; `approve` and `decline` are restricted to owner or delegated approval agent. Approval updates project budget, budget items and scope. This is a *project-owner approval workflow*, not a two-party offer/counteroffer negotiation room. Do not remove it; consider reusing its structured budget items in a separately defined agreement workflow.

**Finding T4 — Two separate message contexts are intentional today.** `worker/index.mjs` uses `threads`/`messages` for direct messages; `worker/community.mjs` uses `projectmessage` entities scoped to accepted project participants. The UI shows both Office Inbox and project Chat. They are distinct persisted channels. Recommended: keep privacy scopes separate but add explicit cross-links and a shared activity presentation rather than merging private direct messages into project chat.

**Finding T5 — Invoices are project-owned, not agreement-sourced.** `worker/community.mjs` stores invoices within the project `invoices` array, with independently entered client, line items, tax, due date and status. No accepted-offer reference is present in the creation path. Existing `web/community.js` invoice tab correctly states that status does not collect or transfer money; printable invoice view displays only status. Recommend optional agreement/milestone reference, reconciliation and provenance, without assuming a payment processor exists.

**Finding T6 — The UI's project entry point is manual.** `web/community.js` lists `Create project +` in Office and supports linking existing posts/briefs. This explains why an accepted application does not necessarily appear as a ready-to-work workspace. The desired change should be designed as a controlled conversion action with idempotency and explicit participant consent, not silent creation.

### Proposed implementation sequence (review before changing backend)
1. **Source-to-work handoff:** introduce a single conversion endpoint that verifies the accepted application/booking, caller authority, participant eligibility and no existing conversion; returns existing project if already converted. Choose whether confirmation is required and which side owns the workspace.
2. **Agreement state:** define offer revision IDs, counterpart consent, immutable accepted snapshot, currency, fee, deliverables, schedule and cancellation rules. Do not treat existing one-sided project approval as bilateral consent.
3. **Contextual navigation:** display linked source opportunity/booking and project in both users' Inbox, Discovery/Bookings and Office without exposing private data.
4. **Invoice provenance:** attach optional accepted agreement ID and payment-record provenance, preserving existing invoices and manual statuses.
5. **Two-account tests:** accept bid → convert once → verify both permissions; accept booking → convert only when requested; reject/withdraw → cannot convert; revoke agent → denied; unrelated third user → denied; duplicate/retry → no duplicate project.

No functional changes have been made in this pass. This trace provides the implementation contract for a scoped engineering PR.
