# TAPPED IN — Release gate and two-account acceptance plan

Updated: 2026-11-07. This is an execution checklist, not a claim of live browser testing.

## Verified
- GitHub Actions development workflow: user confirmed green after build-before-test fix (commit ae73200).
- Active Supabase project: `dmlnbnsoeouufobvzkhb` (`tapped-in-platform`).
- Linked project duplicate preflight: 0 duplicates.
- Linked source orphan preflight: 0 orphans.
- Applied migration `enforce_unique_linked_office_project_source`; read-back confirmed partial unique index `project_linked_source_unique` on `entities`.
- Production code was not merged or deployed.

## Still unverified — blocking release
1. Preview deployment of development branch with working authentication and server APIs.
2. Two real, separate authenticated accounts and a third unrelated account for privacy checks.
3. Negotiation: A proposes; B counters; A accepts; accepted revision cannot be silently replaced.
4. Linked Office handoff: authorized creator creates one project; second creation is rejected; accepted terms snapshot stays unchanged when editable project scope changes.
5. Invitation: B cannot view project before accepting; B accepts and can access; unrelated C is denied.
6. Booking/application acceptance: only authorized participant creates linked project; state transitions reject invalid or stale updates.
7. Project files, messages, invoices and private billing: nonmembers cannot read them; invoice Paid remains a manually recorded status, not a verified payment.
8. Auth signup/confirmation/password reset, storage upload, email delivery and responsive browser QA on iPad and desktop.

## Supabase advisor findings to review
- **WARN**: Five `tapped_internal` JSON helper functions have mutable `search_path`. Review signatures and pin a safe search path in a dedicated migration after testing function resolution.
  https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable
- **WARN**: Auth leaked-password protection disabled. Enable in Supabase Auth settings before public release.
  https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- **INFO**: Six public application tables have RLS enabled without policies. This matches the documented server-only database access model; confirm browser roles have no table grants before treating as safe.
  https://supabase.com/docs/guides/database/database-linter?lint=0008_rls_enabled_no_policy
- **INFO**: Five indexes reported unused; do not drop based on low-traffic statistics.

## Release decision
**Not release-ready.** Automated tests and database integrity checks passed, but authenticated cross-account browser acceptance and Supabase security review remain open. Keep `main` and production code unchanged until these gates pass.
