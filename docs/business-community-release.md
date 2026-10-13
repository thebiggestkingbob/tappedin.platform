# Businesses, community and workspace refinement

## Visible experience

Opened work, brief and contribution cards expose star, save, share and repost actions. A plus control shows the number of distinct members who tapped in, with appreciation/support contributions kept separate from confirmed production credits. The feed also suggests people from Discovery.

Profiles use Work history, Highlights, Moments, Awards and Rate card tabs. Highlights no longer occupy the header, private gig records stay in Office, the bio is brand red, role lists show two roles plus a `+N more` control, and empty contact space is removed. The top profile control uses the profile photo, with initials as its fallback. Availability badges and the availability checkbox are removed.

The calendar's month heading opens month/year navigation within the same calendar. The separate Go to date control is removed. Meetings and owned/attended events join the member's calendar where relevant.

Inbox is a standalone desktop navigation destination and replaces Profile in the mobile bottom bar; Profile remains available at the top. The directory contains contacts/conversations, invitations and requests with no `/000` suffix or empty message pane. Selecting a conversation opens a full conversation takeover with Back to Inbox.

Post snapshot exports have a larger centered logo, red roles/people/partners/team labels, and no URLs in the image. Share text and the permalink remain available separately. The app uses filled icons for common navigation and post actions.

## Connected businesses and offerings

One account can add multiple businesses. Owned, accepted co-owned and accepted employment relationships appear on the person's profile. Public team listings can be enabled by the team owner. Accepted agent representation remains visible alongside these relationships.

Businesses have administration for details/billing, co-owner/employee invitations, and offerings/rate cards. Co-owners can administer a company after accepting; employment does not grant access to billing details. Public company responses exclude banking and rate-card contents.

Personal and business cards contain offerings, descriptions, units and prices. Invoice/banking details are kept separately. A card can be made requestable; requests appear in Inbox and the recipient explicitly shares the offering snapshot. Newly shared and previously saved shared cards are returned without banking details.

Work, briefs and contributions can tag a business and its role. The server resolves the company name and only confirms the business credit when posted by an authorised business administrator. Other tags are labelled as tags. Bookings and private gig records can link business, team, project, work and event contexts. Paid, Pro bono and Passion project are distinct; non-paying booking/gig records require zero fees.

Teams/projects can be linked to a business. Accepted company administrators receive membership in newly linked workspaces. Each workspace has Meetings and Events tabs. Meetings validate dates/times and accepted participants and remain protected by workspace permissions.

Events can be created from Tap In, Discovery or a workspace. Discovery has an Events view and Office lists connected events. Members can RSVP Going/Not going, offer a paid/pro-bono/passion-project service, share the event link, and administrators can review offers and connect a booking. Private event details stay private; public post images cannot be attached to a private event.

Budget replaces Approvals. Itemized proposals retain restricted final approval. Approved items can be assigned to teammates. The budget shows recorded income, spending, received income and net recorded value, with outstanding/paid records. This is recording and tracking, not money collection. Owners, authorised agents and company administrators have appropriate administration access; ordinary members see their own individual ledger entries. Permissions and versions are checked when writes commit.

## Homepage and verification

The public website explains businesses/workplaces, teams, representation, highlights, rate requests, events/services, meetings, paid/pro-bono/passion work and budget tracking. Sign-in/up links use TAP IN. All 13 preview images were replaced with current-interface captures at 2x density, using isolated illustrative accounts. Lossless WebP totals approximately 350 KB for desktop images and 223 KB for mobile images. Intrinsic dimensions are recorded and tested to reserve the correct space.

Validation: production build and compiled worker syntax pass; all 86 Node cases across ten test files pass; `git diff --check` passes. Nine new business/community cases cover consent, administration privacy, rate requests, workspace links, meetings, ledger permissions, event attendance/offers, business tags and non-paying records. The asset regression checks verify all lossless preview resolutions and declared dimensions.

Local Chromium checks: 70 final layout checks across the homepage, feed, Discovery, profile sections, Inbox and Office at 1440, 1280, 1024, 768, 430, 390 and 360px. No horizontal overflow or page JavaScript errors was observed. Connected browser flows include opened-post actions, calendar navigation, inbox takeover, adding a third company, simplified offerings, meetings, budget assignment/records, event creation, rate request/reply, support counts, attendance and service offers. Evidence is stored in `docs/ecosystem-review/`.

No schema migrations, production fixture data or production dependencies are added. Local browser Auth is a fixture and the database is isolated PGlite. Live provider acceptance, live runtime logs, third-party share-sheet behavior and account-specific production flows are separate from these local checks. Company names/ownership are user-entered; accepted workplace/co-owner links express in-app consent rather than external registry verification. Event links open through the application's event deep link. Payment records do not automatically move money or publish individual private fees.
